// Select important elements from the page
const testWrapper = document.querySelector(".test-wrapper");
const testArea = document.querySelector("#test-area");
const originTextElement = document.querySelector("#origin-text p");
const resetButton = document.querySelector("#reset");
const theTimer = document.querySelector(".timer");
const wpmDisplay = document.querySelector("#wpm");
const errorsDisplay = document.querySelector("#errors");
const statusDisplay = document.querySelector("#status");
const scoreList = document.querySelector("#score-list");

// Paragraph options for random typing tests
const textOptions = [
    "Success is the sum of small efforts repeated day in and day out.",
    "JavaScript allows developers to create interactive and dynamic web experiences.",
    "The best way to improve your typing speed is to practice every single day.",
    "Creativity is intelligence having fun while solving meaningful problems.",
    "A professional website should be functional, responsive, readable, and easy to use.",
    "Every great developer started by learning the basics and building small projects.",
    "Focus on accuracy first, then speed will naturally improve with consistent practice."
];

// Timer variables
let timer = [0, 0, 0, 0];
let interval;
let timerRunning = false;

// Typing test variables
let currentText = "";
let errors = 0;
let mistakeActive = false;

// Add leading zero to numbers 9 or below
function leadingZero(time) {
    if (time <= 9) {
        time = "0" + time;
    }

    return time;
}

// Run a minute/second/hundredths timer
function runTimer() {
    let currentTime =
        leadingZero(timer[0]) + ":" +
        leadingZero(timer[1]) + ":" +
        leadingZero(timer[2]);

    theTimer.innerHTML = currentTime;

    timer[3]++;

    timer[0] = Math.floor((timer[3] / 100) / 60);
    timer[1] = Math.floor((timer[3] / 100) - (timer[0] * 60));
    timer[2] = Math.floor(timer[3] - (timer[1] * 100) - (timer[0] * 6000));

    updateWPM();
}

// Start the timer when the user begins typing
function startTimer() {
    let textEnteredLength = testArea.value.length;

    if (textEnteredLength === 0 && !timerRunning) {
        timerRunning = true;
        interval = setInterval(runTimer, 10);
        statusDisplay.innerHTML = "Typing";
        testWrapper.style.borderColor = "#0077ff";
    }
}

// Compare the text entered with the original text
function spellCheck() {
    let textEntered = testArea.value;
    let originTextMatch = currentText.substring(0, textEntered.length);

    if (textEntered === currentText) {
        clearInterval(interval);
        timerRunning = false;

        testWrapper.style.borderColor = "#2ecc71";
        statusDisplay.innerHTML = "Complete";

        saveScore();
        displayScores();

        testArea.disabled = true;
    } else if (textEntered === originTextMatch) {
        testWrapper.style.borderColor = "#0077ff";
        statusDisplay.innerHTML = "Correct";
        mistakeActive = false;
    } else {
        testWrapper.style.borderColor = "#e74c3c";
        statusDisplay.innerHTML = "Mistake";

        if (!mistakeActive) {
            errors++;
            errorsDisplay.innerHTML = errors;
            mistakeActive = true;
        }
    }

    updateWPM();
}

// Calculate and display WPM
function updateWPM() {
    let totalCharacters = testArea.value.length;
    let totalSeconds = timer[3] / 100;

    if (totalSeconds > 0) {
        let wpm = Math.round((totalCharacters / 5) / (totalSeconds / 60));
        wpmDisplay.innerHTML = wpm;
    } else {
        wpmDisplay.innerHTML = 0;
    }
}

// Pick a random paragraph
function pickRandomText() {
    let randomIndex = Math.floor(Math.random() * textOptions.length);
    currentText = textOptions[randomIndex];
    originTextElement.innerHTML = currentText;
}

// Save completed score to localStorage
function saveScore() {
    let finalTime = theTimer.innerHTML;
    let finalWPM = wpmDisplay.innerHTML;

    let newScore = {
        time: finalTime,
        wpm: Number(finalWPM),
        errors: errors,
        totalHundredths: timer[3]
    };

    let scores = JSON.parse(localStorage.getItem("typingScores")) || [];

    scores.push(newScore);

    scores.sort(function (a, b) {
        return a.totalHundredths - b.totalHundredths;
    });

    scores = scores.slice(0, 3);

    localStorage.setItem("typingScores", JSON.stringify(scores));
}

// Display top 3 fastest scores
function displayScores() {
    let scores = JSON.parse(localStorage.getItem("typingScores")) || [];

    scoreList.innerHTML = "";

    if (scores.length === 0) {
        scoreList.innerHTML = "<li>No scores yet</li>";
        return;
    }

    scores.forEach(function (score) {
        let listItem = document.createElement("li");

        listItem.innerHTML =
            `<strong>${score.time}</strong> — ${score.wpm} WPM, ${score.errors} errors`;

        scoreList.appendChild(listItem);
    });
}

// Reset the entire typing test
function reset() {
    clearInterval(interval);

    interval = null;
    timer = [0, 0, 0, 0];
    timerRunning = false;
    errors = 0;
    mistakeActive = false;

    testArea.value = "";
    testArea.disabled = false;

    theTimer.innerHTML = "00:00:00";
    wpmDisplay.innerHTML = "0";
    errorsDisplay.innerHTML = "0";
    statusDisplay.innerHTML = "Ready";

    testWrapper.style.borderColor = "grey";

    pickRandomText();
    testArea.focus();
}

// Event listeners
testArea.addEventListener("keypress", startTimer);
testArea.addEventListener("keyup", spellCheck);
resetButton.addEventListener("click", reset);

// Load the app
pickRandomText();
displayScores();