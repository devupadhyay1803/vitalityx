import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Enforce Admin/Operations role check on server side
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (!currentProfile || currentProfile.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const body = await req.json();
    const { action, targetUserId } = body;

    if (!action || !targetUserId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Fetch target user profile
    const { data: targetProfile, error: fetchError } = await admin
      .from("profiles")
      .select("*")
      .eq("id", targetUserId)
      .single();

    if (fetchError || !targetProfile) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    if (action === "change_role") {
      const { newRole } = body;
      if (!newRole || !["Member", "Coach", "Admin", "Ops"].includes(newRole)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }

      const { error } = await admin
        .from("profiles")
        .update({ role: newRole })
        .eq("id", targetUserId);

      if (error) throw error;

      // Update auth metadata role as well
      await admin.auth.admin.updateUserById(targetUserId, {
        user_metadata: { role: newRole }
      });

      await logAudit({
        actorId: currentUser.id,
        actorRole: currentProfile.role,
        action: "User role changed",
        resourceType: "user",
        resourceId: targetUserId,
        metadata: { oldRole: targetProfile.role, newRole }
      });

      return NextResponse.json({ success: true, message: `Role changed to ${newRole}` });
    }

    if (action === "toggle_status") {
      const currentPrefs = targetProfile.notification_prefs || {};
      const nextDisabled = !currentPrefs.disabled;

      const { error } = await admin
        .from("profiles")
        .update({
          notification_prefs: {
            ...currentPrefs,
            disabled: nextDisabled
          }
        })
        .eq("id", targetUserId);

      if (error) throw error;

      // In a real Supabase setup, to prevent the user from logging in we can ban them:
      if (nextDisabled) {
        await admin.auth.admin.updateUserById(targetUserId, {
          ban_duration: "1000h" // Ban them
        }).catch(err => console.warn("Failed to ban in auth:", err.message));
      } else {
        await admin.auth.admin.updateUserById(targetUserId, {
          ban_duration: "none" // Unban
        }).catch(err => console.warn("Failed to unban in auth:", err.message));
      }

      await logAudit({
        actorId: currentUser.id,
        actorRole: currentProfile.role,
        action: nextDisabled ? "User disabled" : "User enabled",
        resourceType: "user",
        resourceId: targetUserId,
        metadata: { disabled: nextDisabled }
      });

      return NextResponse.json({ success: true, disabled: nextDisabled });
    }

    if (action === "reset_password") {
      const { newPassword } = body;
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }

      const { error } = await admin.auth.admin.updateUserById(targetUserId, {
        password: newPassword
      });

      if (error) throw error;

      await logAudit({
        actorId: currentUser.id,
        actorRole: currentProfile.role,
        action: "User password reset",
        resourceType: "user",
        resourceId: targetUserId
      });

      return NextResponse.json({ success: true, message: "Password reset successful" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Admin user action error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
