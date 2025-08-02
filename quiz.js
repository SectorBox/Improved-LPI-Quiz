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
    // Detect if question allows multiple selections
    const multiSelect = q.question.toLowerCase().includes("choose 2") || q.question.toLowerCase().includes("choose 3");
    const inputType = multiSelect ? "checkbox" : "radio";

    q.options.forEach(opt => {
      const label = document.createElement("label");
      label.classList.add("option");
      label.innerHTML = `<input type="${inputType}" name="option" value="${opt}"> ${opt}`;
      qBox.appendChild(label);
    });
  }

  const feedback = document.createElement("div");
  feedback.id = "feedback";
  qBox.appendChild(feedback);

  const btn = document.createElement("button");
  btn.textContent = "Submit";
  btn.onclick = () => checkAnswer(q, feedback, btn);
  qBox.appendChild(btn);

  quizDiv.appendChild(qBox);
}

function checkAnswer(q, feedback, btn) {
  const correct = q.answer;
  let userAnswer = [];

  if (typedQuestionIds.has(q.id)) {
    const val = document.getElementById("typedAnswer").value.trim();
    userAnswer = [val];
  } else {
    userAnswer = Array.from(document.querySelectorAll('input[name="option"]:checked')).map(e => e.value);
  }

  const isCorrect = typedQuestionIds.has(q.id)
    ? userAnswer[0]?.toLowerCase() === correct[0].toLowerCase()
    : JSON.stringify(userAnswer.sort()) === JSON.stringify(correct.sort());

  answered++;
  if (isCorrect) {
    score++;
  }
  updateScore();

  if (isCorrect) {
    feedback.className = "feedback correct";
    feedback.textContent = "✅ Correct!";
    setTimeout(() => {
      currentQuestion++;
      showQuestion();
    }, 1000);
  } else {
    feedback.className = "feedback incorrect";
    feedback.innerHTML = `❌ Incorrect.<br>Correct answer(s): <strong>${correct.join(", ")}</strong>`;
    btn.textContent = "Next Question";
    btn.onclick = () => {
      review.push({ question: q.question, correct, user: userAnswer });
      currentQuestion++;
      showQuestion();
    };
  }
}

function endTest() {
  showReview();
}

function showReview() {
  const quizDiv = document.getElementById("quiz");
  const reviewDiv = document.getElementById("review");
  quizDiv.innerHTML = `<h2>Quiz Complete!</h2><p>Final Score: ${(score / answered * 100).toFixed(1)}% (${score}/${answered})</p><h3>Missed Questions:</h3>`;
  reviewDiv.innerHTML = "";

  if (review.length === 0) {
    quizDiv.innerHTML += "<p>You got all questions correct! 🎉</p>";
    return;
  }

  review.forEach((item) => {
    const el = document.createElement("div");
    el.className = "review-item";
    el.textContent = item.question;
    el.onclick = () => {
      showReviewDetails(item);
    };
    reviewDiv.appendChild(el);
  });
}

function showReviewDetails(item) {
  const details = document.createElement("div");
  details.className = "review-details";
  details.innerHTML = `<h4>Question:</h4><p>${item.question}</p>
                       <h4>Your Answer:</h4><p>${item.user.join(", ") || "(No answer)"}</p>
                       <h4>Correct Answer(s):</h4><p>${item.correct.join(", ")}</p>`;
  const reviewDiv = document.getElementById("review");
  reviewDiv.innerHTML = "";
  reviewDiv.appendChild(details);
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", isDark);
  document.getElementById("darkModeBtn").textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
}
