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

function getSupabaseRestUrl() {
  const supabaseUrl = process.env.SUPABASE_URL;

  if (!supabaseUrl) {
    return "";
  }

  return supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "") + "/rest/v1";
}

function scoreAnswers(answers = {}) {
  return Object.entries(ANSWER_KEY).reduce((score, [questionId, correctChoice]) => {
    return score + (answers[questionId] === correctChoice ? 1 : 0);
  }, 0);
}

async function insertEntry(chosenNumber, score) {
  const supabaseRestUrl = getSupabaseRestUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseRestUrl || !serviceKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const response = await fetch(`${supabaseRestUrl}/quiz_entries`, {
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
    throw new Error(text || "Failed to save entry to Supabase.");
  }

  return { entry: JSON.parse(text)[0] };
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return json(response, 405, { error: "Only POST requests are allowed." });
  }

  const { answers, chosenNumber, dryRun } = request.body || {};
  const score = scoreAnswers(answers);
  const passed = score >= PASSING_SCORE;

  if (dryRun) {
    return json(response, 200, { score, passed });
  }

  if (!passed) {
    return json(response, 403, {
      error: "You need at least 3 correct answers to register a number.",
      score,
      passed
    });
  }

  if (!NUMBER_PATTERN.test(String(chosenNumber || ""))) {
    return json(response, 400, { error: "Enter a number with 1 to 4 digits." });
  }

  try {
    const result = await insertEntry(String(chosenNumber), score);

    if (result.duplicate) {
      return json(response, 409, {
        error: "This number is already registered. Please choose another one."
      });
    }

    return json(response, 200, {
      chosenNumber: result.entry.chosen_number,
      score: result.entry.score
    });
  } catch (error) {
    return json(response, 500, { error: error.message });
  }
};
