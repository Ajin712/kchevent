const ANSWER_KEY = {
  q1: "b",
  q2: "c",
  q3: "c",
  q4: "b",
  q5: "a"
};

const PASSING_SCORE = 3;
const NUMBER_PATTERN = /^[0-9]{1,4}$/;

function json(response, status, body) {
  response.status(status).json(body);
}

function scoreAnswers(answers = {}) {
  return Object.entries(ANSWER_KEY).reduce((score, [questionId, correctChoice]) => {
    return score + (answers[questionId] === correctChoice ? 1 : 0);
  }, 0);
}

async function insertEntry(chosenNumber, score) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/quiz_entries`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify({
      chosen_number: chosenNumber,
      score
    })
  });

  if (response.status === 409) {
    return { duplicate: true };
  }

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "Supabase 저장에 실패했습니다.");
  }

  return { entry: JSON.parse(text)[0] };
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return json(response, 405, { error: "POST 요청만 사용할 수 있습니다." });
  }

  const { answers, chosenNumber, dryRun } = request.body || {};
  const score = scoreAnswers(answers);
  const passed = score >= PASSING_SCORE;

  if (dryRun) {
    return json(response, 200, { score, passed });
  }

  if (!passed) {
    return json(response, 403, { error: "3개 이상 맞혀야 번호를 등록할 수 있습니다.", score, passed });
  }

  if (!NUMBER_PATTERN.test(String(chosenNumber || ""))) {
    return json(response, 400, { error: "번호는 1~4자리 숫자로 입력해 주세요." });
  }

  try {
    const result = await insertEntry(String(chosenNumber), score);

    if (result.duplicate) {
      return json(response, 409, { error: "이미 사용된 번호입니다. 다른 번호를 입력해 주세요." });
    }

    return json(response, 200, {
      chosenNumber: result.entry.chosen_number,
      score: result.entry.score
    });
  } catch (error) {
    return json(response, 500, { error: error.message });
  }
};
