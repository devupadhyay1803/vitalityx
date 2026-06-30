const { createClient } = require('@supabase/supabase-js');
const http = require('http');

async function test() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'demo.staff@vitalityx.ai',
    password: 'Demo@12345'
  });
  
  if (error) {
    console.error("Login failed:", error.message);
    return;
  }
  
  const access_token = data.session.access_token;
  const refresh_token = data.session.refresh_token;
  
  // Create cookie string for Next.js App Router (Supabase SSR uses sb-[id]-auth-token)
  // But wait, the standard Supabase SSR cookie name depends on the project ID.
  // Next.js uses the cookies passed in the request.
  
  // Let's just use curl with the auth header if it's an API, but it's a page!
  console.log("Logged in! Session:", access_token.substring(0, 20) + "...");
}

test();
