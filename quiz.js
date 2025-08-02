let questions = [];
let currentQuestion = 0;
let score = 0;
let answered = 0;
let review = [];
const typedQuestionIds = new Set([20, 40, 56, 63]);

// Load dark mode preference
window.onload = function () {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
    document.getElementById("darkModeBtn").textContent = "☀️ Light Mode";
  }
};

fetch('lpi_questions.json')
  .then(res => res.json())
  .then(data => {
    questions = data.sort(() => Math.random() - 0.5);
    showQuestion();
    updateScore();
  });

function updateScore() {
  const percent = answered > 0 ? ((score / answered) * 100).toFixed(1) : "0.0";
  document.getElementById("score").textContent = `Score: ${percent}% (${score} / ${answered})`;
}

function showQuestion() {
  const quizDiv = document.getElementById("quiz");
  quizDiv.innerHTML = "";

  if (currentQuestion >= questions.length) {
    return showReview();
  }

  const q = questions[currentQuestion];
  const qBox = document.createElement("div");
  qBox.classList.add("question");
  qBox.innerHTML = `<p><strong>Question ${currentQuestion + 1} of ${questions.length}:</strong></p><h3>${q.question}</h3>`;

  if (typedQuestionIds.has(q.id)) {
    // Typed-answer question
    qBox.innerHTML += '<input type="text" id="typedAnswer" placeholder="Type your answer">';
  } else {
    // ✅ Detect if multiple answers are allowed
    const multiSelect = 
      q.answer.length > 1 || 
      q.question.toLowerCase().includes("choose 2") || 
      q.question.toLowerCase().includes("choose 3");

    const inputType = multiSelect ? "checkbox" : "radio";

    q.options.forEach(opt => {
      const label = document.createElement("label");
      label.classList.add(
