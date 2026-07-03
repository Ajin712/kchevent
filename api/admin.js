function json(response, status, body) {
  response.status(status).json(body);
}

function getSupabaseRestUrl() {
  const supabaseUrl = process.env.SUPABASE_URL;

  if (!supabaseUrl) {
    return "";
  }

  return supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "") + "/rest/v1";
}

async function fetchEntries() {
  const supabaseRestUrl = getSupabaseRestUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseRestUrl || !serviceKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const response = await fetch(
    `${supabaseRestUrl}/quiz_entries?select=chosen_number,score,created_at&order=created_at.desc`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`
      }
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "Failed to fetch entries from Supabase.");
  }

  return JSON.parse(text);
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return json(response, 405, { error: "Only POST requests are allowed." });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return json(response, 500, { error: "ADMIN_PASSWORD is not configured." });
  }

  if ((request.body || {}).password !== process.env.ADMIN_PASSWORD) {
    return json(response, 401, { error: "Admin password is incorrect." });
  }

  try {
    const entries = await fetchEntries();
    return json(response, 200, { entries });
  } catch (error) {
    return json(response, 500, { error: error.message });
  }
};
