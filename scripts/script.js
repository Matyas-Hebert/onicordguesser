const startScreen = document.getElementById('startscreen');
const roundsValue = document.getElementById('rounds-value');
const timeValue = document.getElementById('time-value');
const seedInput = document.getElementById('seed');
const randomizeButton = document.getElementById('randomize-seed');
const playButton = document.getElementById('play-button');
const roundLabel = document.getElementById('current-round');
const mapViewport = document.getElementById('map-viewport');
const guessBtn = document.getElementById('guess-button');
const scoreLabel = document.getElementById("total-score");

const timerange = document.getElementById('time');
const roundrange = document.getElementById('rounds');

const infoonamap = document.getElementById('info-on-a-map');
const menubutton = document.getElementById('menu');
const remainingtime = document.getElementById('remaining-time');

const timeinfoblock = document.getElementById('time-info-block');
let difficulty = 1;

let labelsData = [];
let pinsData = [];
let map = undefined;
let transform = undefined;

async function preloadGame() {
    playButton.classList.add("disabled");
    playButton.disabled = true;
    playButton.innerText = "NAČÍTÁ SE LOKACE"
    window.game = new Game({
         totalRounds: parseInt(roundrange.value, 10),
         seed: seedInput.value,
         mousedown: false,
         mousedowntime: 0,
         mousedownpos: {x: 0, y: 0},
         difficulty: difficulty
    });

    console.log("preloading, difficulties:", window.game.difficulty, difficulty);
    window.game.difficulty = difficulty;

    if (window.game.time == -1){
        timeinfoblock.style.display = "none";
    }
    else{
        timeinfoblock.style.display = "block";
    }

    console.log("selected seed", game);

    map = createMap();
    setupMapHandlers(map);
    setUpLabels();
    setGuessButtonEnabled(false);
    
    transform = setMapReferences(
        { map: { x: 0.9276796019399111, y: 0.08891071533588515 }, real: { x: 11176.81590701724, y: -170.26402619122928 } },
        { map: { x: 0.2939210488433349, y: 0.38430105280063487 }, real: { x: 1443, y: 4366 } }
    );

    console.log("updated transform");

    const folders = await window.listPanoramaFolders();
    console.log("listed folders");
    const weights = await window.getPanoramaWeights(folders);
    console.log("got panorama weights");
    window.game.setWeights(weights);

    console.log("set weights");

    loadNewPhotosphere();

    console.log("loaded photosphere");

    window.game.incrementRound();
    playButton.classList.remove("disabled");
    playButton.disabled = false;
    playButton.innerText = "HRÁT";
}