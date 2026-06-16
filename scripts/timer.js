let timeLeft = 0;
let totals = 0;
let timerId = null;

function startTimer(totalSeconds) {
    if (totalSeconds == -1){
        totalSeconds = 1000000;
    }
    totals = totalSeconds;
    clearInterval(timerId); 

    timeLeft = totalSeconds;

    updateDisplay(timeLeft);

    timerId = setInterval(function() {
        timeLeft--;

        updateDisplay(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timerId);
            window.game.yourGuesses.push({x: NaN, z: NaN});
            setGuessButtonEnabled(true);      
            guessbtnclick();
            console.log("Time is completely up!");
        }
    }, 1000);
}

function updateDisplay(secondsRemaining) {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    remainingtime.innerText = String(minutes) + ":" + String(seconds).padStart(2, "0");
}

function stopTimer() {
    clearInterval(timerId);
}