function randomizeSeed() {
    seedInput.value = Math.floor(Math.random() * 1000000).toString();
    preloadGame();
}

function seededRandom(seedValue, round) {
    const seedText = `${round}:${seedValue}`;
    let hash = 0;
    for (let i = 0; i < seedText.length; i += 1) {
        hash = ((hash << 5) - hash) + seedText.charCodeAt(i);
        hash |= 0;
    }
    const positiveHash = hash >>> 0;
    return (positiveHash % 1000000) / 1000000;
}

let seedTimeout;

seedInput.oninput = function(){
    playButton.classList.add("disabled");
    playButton.disabled = true;
    playButton.innerText = "NAČÍTÁ SE LOKACE"
    clearTimeout(seedTimeout);

    seedTimeout = setTimeout(function() {
        preloadGame();
    }, 1000);
}

menubutton.onclick = function(){
    location.reload();
    // startScreen.style.display = 'flex';
    // removePins(map);
    // removelines();
    // resetzoom();
    // stopTimer();
    // infoonamap.style.display = "none";
    // mapViewport.classList.remove("fullscreen");
    // randomizeSeed();
}

function startGame() {
    startScreen.style.display = 'none';
    startTimer(window.game.time);
}

timerange.oninput = function(){
    timeinfoblock.style.display = "block";
    if (timerange.value > 615){
        window.game.time = -1;
        timeValue.innerText = "∞";
        timeinfoblock.style.display = "none";
        return;
    }
    if (timerange.value > 600){
        timeValue.innerText = "10:00";
        window.game.time = 600;
        return;
    }
    let seconds = Math.round(timerange.value/5)*5;
    window.game.time = seconds;
    let minutes = Math.floor(seconds/60);
    timeValue.innerText = String(minutes)+":"+String(seconds-minutes*60).padStart(2, "0");
}

roundrange.oninput = function(){
    roundsValue.innerText = String(roundrange.value);
    window.game.totalRounds = Number(roundrange.value);
}

function selectDifficulty(diff){
    window.game.difficulty = diff;
    difficulty = diff;
    let e = document.getElementById("easy");
    let n = document.getElementById("normal");
    let h = document.getElementById("hard");
    let i = document.getElementById("imp");

    e.className = "notchosen";
    n.className = "notchosen";
    h.className = "notchosen";
    i.className = "notchosen";

    if (diff == 1){
        e.classList = [];
    }
    if (diff == 2){
        n.classList = [];
    }
    if (diff == 3){
        h.classList = [];
    }
    if (diff == 4){
        i.classList = [];
    }

    window.updaterestrictions(diff);
}