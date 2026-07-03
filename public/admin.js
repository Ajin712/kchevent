const adminForm = document.querySelector("#adminForm");
const adminPassword = document.querySelector("#adminPassword");
const adminTools = document.querySelector("#adminTools");
const refreshButton = document.querySelector("#refreshButton");
const csvButton = document.querySelector("#csvButton");
const adminStatus = document.querySelector("#adminStatus");
const tableWrap = document.querySelector("#tableWrap");
const entryRows = document.querySelector("#entryRows");
const countText = document.querySelector("#countText");

let password = "";
let entries = [];

function formatDate(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function renderEntries() {
  entryRows.replaceChildren();

  entries.forEach((entry) => {
    const row = document.createElement("tr");
    [entry.chosen_number, `${entry.score} / 5`, formatDate(entry.created_at)].forEach((text) => {
      const cell = document.createElement("td");
      cell.textContent = text;
      row.append(cell);
    });
    entryRows.append(row);
  });

  countText.textContent = `등록 ${entries.length}건`;
  tableWrap.classList.toggle("hidden", entries.length === 0);
}

async function loadEntries() {
  adminStatus.textContent = "목록을 불러오는 중입니다...";

  const response = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "목록을 불러오지 못했습니다.");
  }

  entries = data.entries;
  renderEntries();
  adminTools.classList.remove("hidden");
  adminStatus.textContent = entries.length === 0 ? "아직 등록된 번호가 없습니다." : "";
}

adminForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  password = adminPassword.value;

  try {
    await loadEntries();
  } catch (error) {
    adminStatus.textContent = error.message;
  }
});

refreshButton.addEventListener("click", async () => {
  try {
    await loadEntries();
  } catch (error) {
    adminStatus.textContent = error.message;
  }
});

csvButton.addEventListener("click", () => {
  const header = ["chosen_number", "score", "created_at"];
  const rows = entries.map((entry) => [entry.chosen_number, entry.score, entry.created_at]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quiz-entries.csv";
  link.click();
  URL.revokeObjectURL(url);
});
