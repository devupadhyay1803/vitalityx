const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Read environment variables
const envLocalPath = path.join(__dirname, "../.env.local");
if (!fs.existsSync(envLocalPath)) {
  console.error("Missing .env.local file");
  process.exit(1);
}

const env = fs.readFileSync(envLocalPath, "utf8");
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const url = urlMatch[1].trim();
const key = keyMatch[1].trim();

const supabase = createClient(url, key, {
  auth: { persistSession: false }
});

const ADMIN_EMAIL = "admin@vitalityx.com";
const ADMIN_PASSWORD = "password";

async function createAdminUser() {
  console.log("Checking for existing admin user...");
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Failed to list users:", listError.message);
    process.exit(1);
  }

  const existingAdmin = usersData.users.find(u => u.email === ADMIN_EMAIL);
  let userId;

  if (existingAdmin) {
    console.log("Admin user already exists in Auth. Updating password and metadata...");
    userId = existingAdmin.id;
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { role: "Admin", full_name: "VitalityX Admin" }
    });

    if (updateError) {
      console.error("Failed to update user:", updateError.message);
      process.exit(1);
    }
  } else {
    console.log("Creating new admin user in Auth...");
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { role: "Admin", full_name: "VitalityX Admin" }
    });

    if (createError || !createData.user) {
      console.error("Failed to create user:", createError?.message || "Unknown error");
      process.exit(1);
    }

    userId = createData.user.id;
  }

  console.log("Ensuring user profile row in database...");
  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      full_name: "VitalityX Admin",
      email: ADMIN_EMAIL,
      role: "Admin"
    }, { onConflict: "id" });

  if (upsertError) {
    console.error("Failed to upsert database profile:", upsertError.message);
    process.exit(1);
  }

  console.log("\n=============================================");
  console.log("Demo Admin Account Provisioned Successfully!");
  console.log("=============================================");
  console.log(`Email:    ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log("=============================================\n");
}

createAdminUser();
