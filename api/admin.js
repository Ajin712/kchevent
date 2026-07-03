function json(response, status, body) {
  response.status(status).json(body);
}

async function fetchEntries() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/quiz_entries?select=chosen_number,score,created_at&order=created_at.desc`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`
      }
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "Supabase 조회에 실패했습니다.");
  }

  return JSON.parse(text);
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return json(response, 405, { error: "POST 요청만 사용할 수 있습니다." });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return json(response, 500, { error: "관리자 비밀번호 환경변수가 설정되지 않았습니다." });
  }

  if ((request.body || {}).password !== process.env.ADMIN_PASSWORD) {
    return json(response, 401, { error: "관리자 비밀번호가 올바르지 않습니다." });
  }

  try {
    const entries = await fetchEntries();
    return json(response, 200, { entries });
  } catch (error) {
    return json(response, 500, { error: error.message });
  }
};
