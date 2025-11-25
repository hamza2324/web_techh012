
const questions = [
    {
        question: "HTML stands for?",
        options: ["Hyper Text Markup Language", "Heading toward many languages", "Hyper Text Many Language"],
        answer: 0
    },
    {
        question: "CSS is used for styling.",
        options: ["True", "False"],
        answer: 0
    },
    {
        question: "Which tag is used for Line break",
        options: ["<b>", "<lb>", "<br>"],
        answer: 2
    },
    {
        question: "Flexbox is used for layout in CSS.",
        options: ["True", "False"],
        answer: 0
    },
    {
        question: "Which has higher priority?",
        options: ["ID", "Class", "Tags"],
        answer: 0
    }
];

let index = 0;
let score = 0;

const startScreen = document.getElementById("start");
const quizScreen = document.getElementById("quiz");
const resultScreen = document.getElementById("result");

const questionText = document.getElementById("question");
const optionContainer = document.getElementById("optioncontainer");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("nextbtn");

document.getElementById("startbtn").addEventListener("click", () => {
    startScreen.classList.add("hide");
    quizScreen.classList.remove("hide");
    loadQuestion();
});

function loadQuestion() {
    feedback.textContent = "";
    nextBtn.classList.add("hidden");

    const q = questions[index];
    questionText.textContent = q.question;

    optionContainer.innerHTML = "";

    q.options.forEach((option, i) => {
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.classList.add("optionbtn");

        btn.addEventListener("click", () => checkAnswer(i, btn));

        optionContainer.appendChild(btn);
    });
}

function checkAnswer(selected, btnElement) {
    const correct = questions[index].answer;

    if (selected === correct) {
        score++;
        btnElement.classList.add("correct");
        feedback.textContent = "Correct!";
    } else {
        btnElement.classList.add("wrong");
        feedback.textContent = "Wrong!";
    }

    disableOptions();
    nextBtn.classList.remove("hidden");
}


function disableOptions() {
    document.querySelectorAll(".optionbtn").forEach(btn => {
        btn.disabled = true;
    });
}

nextBtn.addEventListener("click", () => {
    index++;

    if (index < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
});


function showResult() {
    quizScreen.classList.add("hide");
    resultScreen.classList.remove("hide");

    document.getElementById("finalscore").textContent =
        `${score} / ${questions.length}`;

    document.getElementById("finalmessage").textContent =
        score >= 4 ? "well done!" : "Try Again";
}
