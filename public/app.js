const questions = [
  {
    id: "q1",
    text: "다음 중 컴공 졸업 후 대표적인 진출 분야가 아닌 것은?",
    choices: [
      { id: "a", label: "컴퓨터 비전" },
      { id: "b", label: "프로게이머" },
      { id: "c", label: "정보보안" },
      { id: "d", label: "핀테크" }
    ]
  },
  {
    id: "q2",
    text: "다음 중 컴공 진학이 추천되지 않는 사람은?",
    choices: [
      { id: "a", label: "컴퓨터/코딩/알고리즘을 좋아하는 사람" },
      { id: "b", label: "수학을 잘하는 사람" },
      { id: "c", label: "그냥 컴공이 멋져 보이는 사람" },
      { id: "d", label: "게임 만드는 걸 좋아하는 사람" }
    ]
  },
  {
    id: "q3",
    text: "충남대 컴공 주요 행사로 옳지 않은 것은?",
    choices: [
      { id: "a", label: "모각코" },
      { id: "b", label: "카테캠" },
      { id: "c", label: "NYPC" },
      { id: "d", label: "아나겟돈" }
    ]
  },
  {
    id: "q4",
    text: "답 찍을 때 몇 번으로 찍는 게 가장 좋을까요?",
    choices: [
      { id: "a", label: "2" },
      { id: "b", label: "3" },
      { id: "c", label: "4" },
      { id: "d", label: "5" }
    ]
  },
  {
    id: "q5",
    text: "다음 중 알고리즘 찍먹으로 추천되지 않은 것은?",
    choices: [
      { id: "a", label: "백준" },
      { id: "b", label: "코드 트리" },
      { id: "c", label: "비버 챌린지" },
      { id: "d", label: "프로그래머스" }
    ]
  }
];

const state = {
  index: 0,
  answers: {}
};

const quizPanel = document.querySelector("#quizPanel");
const resultPanel = document.querySelector("#resultPanel");
const progressText = document.querySelector("#progressText");
const questionText = document.querySelector("#questionText");
const choices = document.querySelector("#choices");
const prevButton = document.querySelector("#prevButton");
const nextButton = document.querySelector("#nextButton");
const scoreText = document.querySelector("#scoreText");
const resultTitle = document.querySelector("#resultTitle");
const resultMessage = document.querySelector("#resultMessage");
const numberForm = document.querySelector("#numberForm");
const chosenNumber = document.querySelector("#chosenNumber");
const statusText = document.querySelector("#statusText");
const restartButton = document.querySelector("#restartButton");

function renderQuestion() {
  const question = questions[state.index];
  progressText.textContent = `${state.index + 1} / ${questions.length}`;
  questionText.textContent = question.text;
  choices.replaceChildren();

  question.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.className = "choice";
    button.type = "button";
    button.textContent = choice.label;
    button.dataset.selected = state.answers[question.id] === choice.id;
    button.addEventListener("click", () => {
      state.answers[question.id] = choice.id;
      renderQuestion();
    });
    choices.append(button);
  });

  prevButton.disabled = state.index === 0;
  nextButton.disabled = !state.answers[question.id];
  nextButton.textContent = state.index === questions.length - 1 ? "결과 보기" : "다음";
}

async function showResult() {
  quizPanel.classList.add("hidden");
  resultPanel.classList.remove("hidden");
  statusText.textContent = "점수를 확인하는 중입니다...";

  try {
    const response = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: state.answers, dryRun: true })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "점수를 확인하지 못했습니다.");
    }

    scoreText.textContent = `${data.score} / ${questions.length}`;
    resultTitle.textContent = data.passed ? "번호 등록 가능" : "아쉽지만 등록 기준 미달";
    resultMessage.textContent = data.passed
      ? "3개 이상 맞혔습니다. 원하는 번호를 입력해 주세요."
      : "3개 이상 맞혀야 번호를 등록할 수 있습니다.";
    numberForm.classList.toggle("hidden", !data.passed);
    statusText.textContent = "";
  } catch (error) {
    resultTitle.textContent = "확인 실패";
    resultMessage.textContent = "잠시 후 다시 시도해 주세요.";
    statusText.textContent = error.message;
  }
}

nextButton.addEventListener("click", () => {
  if (state.index < questions.length - 1) {
    state.index += 1;
    renderQuestion();
    return;
  }

  showResult();
});

prevButton.addEventListener("click", () => {
  state.index = Math.max(0, state.index - 1);
  renderQuestion();
});

numberForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusText.textContent = "등록 중입니다...";

  try {
    const response = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: state.answers,
        chosenNumber: chosenNumber.value.trim()
      })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "등록하지 못했습니다.");
    }

    numberForm.classList.add("hidden");
    statusText.textContent = `${data.chosenNumber}번 등록이 완료되었습니다.`;
  } catch (error) {
    statusText.textContent = error.message;
  }
});

restartButton.addEventListener("click", () => {
  state.index = 0;
  state.answers = {};
  chosenNumber.value = "";
  statusText.textContent = "";
  numberForm.classList.add("hidden");
  resultPanel.classList.add("hidden");
  quizPanel.classList.remove("hidden");
  renderQuestion();
});

renderQuestion();
