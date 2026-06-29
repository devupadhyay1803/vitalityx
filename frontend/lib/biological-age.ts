import { createAdminClient } from "@/lib/supabase/admin";

export type BioInputs = {
  chronologicalAge: number;
  biomarkers: { name: string; value: number }[];
  checkins: { sleep: number; energy: number; mood: number }[];
};

export type BioOutputs = {
  biologicalAge: number;
  longevityScore: number;
  metabolicScore: number;
  inflammationScore: number;
  cardiovascularScore: number;
  hormonalScore: number;
  recoveryScore: number;
  confidenceScore: number;
};

// ----------------------------------------------------------------------
// PURE CALCULATION FUNCTIONS
// ----------------------------------------------------------------------

export function calculateBiologicalAge(inputs: BioInputs): number {
  let baseAge = inputs.chronologicalAge;
  if (!baseAge || baseAge <= 0) return 30; // Fallback
  
  let modifier = 0;
  
  // Biomarker impact (mock logic, tune later)
  inputs.biomarkers.forEach(b => {
    const v = b.value;
    switch(b.name.toLowerCase()) {
      case 'hba1c': 
        if (v > 5.7) modifier += (v - 5.7) * 2;
        else modifier -= 0.5;
        break;
      case 'hs-crp':
        if (v > 3.0) modifier += 1.5;
        else if (v < 1.0) modifier -= 1;
        break;
      case 'vo2 max':
        if (v < 35) modifier += 2;
        else if (v > 45) modifier -= 2.5;
        break;
      case 'ldl':
        if (v > 100) modifier += (v - 100) * 0.02;
        break;
    }
  });

  // Check-in impact (average last 7 checkins)
  if (inputs.checkins.length > 0) {
    const avgSleep = inputs.checkins.reduce((s, c) => s + c.sleep, 0) / inputs.checkins.length;
    if (avgSleep < 6) modifier += 1;
    if (avgSleep > 8) modifier -= 1;
  }

  return Number(Math.max(18, baseAge + modifier).toFixed(1));
}

export function calculateLongevityScore(outputs: BioOutputs, inputs: BioInputs): number {
  // Score out of 100
  let score = 100;
  
  // Penalty for bio age exceeding chrono age
  const ageDiff = outputs.biologicalAge - inputs.chronologicalAge;
  if (ageDiff > 0) score -= (ageDiff * 2);
  else score += (Math.abs(ageDiff) * 2);

  // Blend other scores
  score = (score + outputs.metabolicScore + outputs.cardiovascularScore + outputs.inflammationScore) / 4;
  
  return Number(Math.min(100, Math.max(0, score)).toFixed(0));
}

export function calculateRiskScore(category: 'metabolic' | 'inflammation' | 'cardiovascular' | 'hormonal' | 'recovery', inputs: BioInputs): number {
  // Return score out of 100 (100 is optimal, 0 is max risk)
  // Mock implementations to be tuned later by medical team
  
  const hasMarker = (names: string[]) => inputs.biomarkers.some(b => names.includes(b.name.toLowerCase()));
  const getMarker = (name: string) => inputs.biomarkers.find(b => b.name.toLowerCase() === name)?.value;

  let score = 85; // Baseline assumed relatively healthy

  if (category === 'metabolic') {
    const a1c = getMarker('hba1c');
    const glu = getMarker('fasting glucose');
    if (a1c && a1c > 5.7) score -= 15;
    if (glu && glu > 100) score -= 10;
  }
  
  if (category === 'inflammation') {
    const crp = getMarker('hs-crp');
    if (crp && crp > 3) score -= 20;
    if (crp && crp < 1) score += 10;
  }

  if (category === 'recovery') {
    if (inputs.checkins.length > 0) {
      const avgSleep = inputs.checkins.reduce((s, c) => s + c.sleep, 0) / inputs.checkins.length;
      score = avgSleep * 10; // Sleep out of 10
    }
  }

  return Number(Math.min(100, Math.max(0, score)).toFixed(0));
}

export function calculateConfidence(inputs: BioInputs): number {
  // Determine how confident we are in the score based on data density
  let confidence = 0;
  if (inputs.chronologicalAge) confidence += 20;
  
  // Points per biomarker category
  if (inputs.biomarkers.length > 0) confidence += Math.min(60, inputs.biomarkers.length * 5);
  
  // Points for checkins
  if (inputs.checkins.length > 0) confidence += Math.min(20, inputs.checkins.length * 2);

  return Math.min(100, confidence);
}

// ----------------------------------------------------------------------
// ENGINE DRIVER
// ----------------------------------------------------------------------

export async function triggerRecalculation(memberId: string): Promise<boolean> {
  const admin = createAdminClient();

  // 1. Fetch member baseline
  const { data: profile } = await admin.from('profiles').select('date_of_birth').eq('id', memberId).single();
  let chronoAge = 35; // Default if no DOB
  if (profile?.date_of_birth) {
    const dob = new Date(profile.date_of_birth);
    const diff = Date.now() - dob.getTime();
    chronoAge = new Date(diff).getUTCFullYear() - 1970;
  }

  // 2. Fetch recent biomarkers (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const { data: biomarkers } = await admin.from('biomarkers')
    .select('name, value')
    .eq('member_id', memberId)
    .gte('tested_at', ninetyDaysAgo.toISOString());

  // 3. Fetch recent checkins (last 14 days)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  
  const { data: checkins } = await admin.from('daily_checkins')
    .select('sleep_score, energy_score, mood_score')
    .eq('member_id', memberId)
    .gte('checked_in_at', fourteenDaysAgo.toISOString());

  const inputs: BioInputs = {
    chronologicalAge: chronoAge,
    biomarkers: (biomarkers || []).map(b => ({ name: b.name, value: Number(b.value) })),
    checkins: (checkins || []).map(c => ({ sleep: c.sleep_score || 7, energy: c.energy_score || 7, mood: c.mood_score || 7 }))
  };

  // 4. Calculate
  const metabolicScore = calculateRiskScore('metabolic', inputs);
  const inflammationScore = calculateRiskScore('inflammation', inputs);
  const cardiovascularScore = calculateRiskScore('cardiovascular', inputs);
  const hormonalScore = calculateRiskScore('hormonal', inputs);
  const recoveryScore = calculateRiskScore('recovery', inputs);
  const biologicalAge = calculateBiologicalAge(inputs);
  const confidenceScore = calculateConfidence(inputs);

  const outputs: BioOutputs = {
    biologicalAge,
    metabolicScore,
    inflammationScore,
    cardiovascularScore,
    hormonalScore,
    recoveryScore,
    longevityScore: 0, // Calculated next
    confidenceScore,
  };

  outputs.longevityScore = calculateLongevityScore(outputs, inputs);

  // 5. Compare with previous to prevent redundant saves and check for significant shifts
  const { data: prevRecord } = await admin.from('biological_age_records')
    .select('*')
    .eq('member_id', memberId)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .single();

  if (prevRecord && prevRecord.biological_age === outputs.biologicalAge && prevRecord.longevity_score === outputs.longevityScore) {
    // No significant change, skip save to save DB bloat
    return false;
  }

  // 6. Save new record
  const { error } = await admin.from('biological_age_records').insert({
    member_id: memberId,
    chronological_age: chronoAge,
    biological_age: outputs.biologicalAge,
    longevity_score: outputs.longevityScore,
    metabolic_score: outputs.metabolicScore,
    inflammation_score: outputs.inflammationScore,
    cardiovascular_score: outputs.cardiovascularScore,
    hormonal_score: outputs.hormonalScore,
    recovery_score: outputs.recoveryScore,
    confidence_score: outputs.confidenceScore,
    calculation_version: '1.0.0',
    calculated_at: new Date().toISOString()
  });

  if (error) {
    console.error("Failed to save bio age record:", error);
    return false;
  }

  // 7. Trigger Notification if significant change
  if (prevRecord) {
    const ageDiff = prevRecord.biological_age - outputs.biologicalAge;
    if (Math.abs(ageDiff) >= 0.5) {
      const isImprovement = ageDiff > 0;
      await admin.from('notifications').insert({
        member_id: memberId,
        title: isImprovement ? 'Biological Age Improved!' : 'Biological Age Shift',
        message: `Your biological age has ${isImprovement ? 'decreased' : 'increased'} by ${Math.abs(ageDiff).toFixed(1)} years based on new data.`,
        category: 'Health',
        link_url: '/member/dashboard'
      });
    }
  }

  return true;
}
