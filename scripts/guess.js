function setGuessButtonEnabled(enable) {
    guessBtn.disabled = !Boolean(enable);
};

function guessbtnclick(){
    if (window.game.guessed){
        mapViewport.classList.remove("fullscreen");
        infoonamap.style.display = "none";
        window.game.guessed = false;
        guessBtn.innerText = "HÁDAT";
        window.game.incrementRound();

        loadNewPhotosphere();
        startTimer(window.game.time);
        resetzoom();
        removelines();
        removePins(map);
        setGuessButtonEnabled(false);
    }
    else{
        stopTimer();
        let pan = window.game.currentPan;
        if (pan === undefined){
            return;
        }

        mapViewport.className = "fullscreen";
        window.game.guessed = true;
        let mapCoords = translateRealToMap({x: pan.X, z: pan.Z});
        window.game.correctGuesses.push(mapCoords);

        if (window.game.currentRound > window.game.totalRounds){
            guessBtn.style.display = "none";
            infoonamap.style.display = "block";
            let timestring = "";
            let time = window.game.timetaken;
            if (time == -1){
                timestring = "∞";
            }
            else{
                timestring = String(Math.floor(time/60))+":"+String(time-Math.floor(time/60)*60).padStart(2, "0");
            }
            infoonamap.innerText = "VZDÁLENOST: "+String(Math.round(window.game.totalDistance))+
                " BLOKŮ\nSKÓRE: "+String(window.game.currentScore)+
                "\nPOČET KOL: "+String(window.game.totalRounds)+
                "\nČAS: "+timestring+
                "\nOBTÍŽNOST: "+difficultystring(window.game.difficulty);

            for (let i=0; i<window.game.totalRounds; i++){
                addPin(map, {x: window.game.correctGuesses[i].x, y: window.game.correctGuesses[i].z}, "green");
                addPin(map, {x: window.game.yourGuesses[i].x, y: window.game.yourGuesses[i].z});

                drawLine(window.game.correctGuesses[i], window.game.yourGuesses[i]);
                resetzoom();
            }
        }
        else{
            addPin(map, {x: mapCoords.x, y: mapCoords.z}, "green");
            let y = window.game.yourGuesses[window.game.currentRound-1];
            console.log("y:", y);
            drawLine(mapCoords, y);
            window.game.timetaken += totals-timeLeft;
            guessBtn.innerText = "DALŠÍ";

            let distance = 0;
            if (y.x){
                distance = getDistancexz({x: pan.X, z: pan.Z}, translateMapToReal(y));
            }
            let score = 0;
            if (y.x){
                score = getScore(distance);
            }
            window.game.totalDistance += distance;
            window.game.addScore(Math.floor(score));

            infoonamap.style.display = "block";
            if (y.x){
                infoonamap.innerText = "VZDÁLENOST: "+String(Math.round(distance))+" BLOKŮ\nSKÓRE: "+String(Math.floor(score));
            }
            else{
                infoonamap.innerText = "NESTIHL SI HÁDAT\nSKÓRE: "+String(Math.floor(score));
            }

            if (y.x){
                let normalizeddist = getDistancexz(mapCoords, y);
                let zoomlevel = 0.5/normalizeddist;
                map.viewport.zoomTo(Math.min(50, zoomlevel));
                map.viewport.panTo(new OpenSeadragon.Point(average(mapCoords.x, y.x), average(mapCoords.z, y.z)));
            }
            else{
                resetzoom();
            }
        }

        if (window.game.currentRound == window.game.totalRounds){
            window.game.guessed = false;
            guessBtn.innerText = "KONEC";
            window.game.incrementRound();
        }
    }
}

function difficultystring(diff){
    if (diff == 1){
        return "SNADNÁ";
    }
    if (diff == 2){
        return "TĚŽKÁ";
    }
    if (diff == 3){
        return "PEKELNÁ";
    }
    if (diff == 4){
        return "NE";
    }
}

guessBtn.onclick = function() {
    guessbtnclick();
}

function average(p, q){
    return (p+q)/2
}

function drawLine(p1, p2) {
    console.log(p1.x, p2.x);
    if(!p1.x || !p2.x){
        console.log("returning");
        return;
    }
    const pt1 = { x: p1.x, y: p1.y !== undefined ? p1.y : p1.z };
    const pt2 = { x: p2.x, y: p2.y !== undefined ? p2.y : p2.z };

    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.setAttribute("viewBox", "0 0 1 1");
    svgElement.style.width = "100%";
    svgElement.style.height = "100%";
    svgElement.style.pointerEvents = "none";
    svgElement.style.zIndex = "8000";

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", pt1.x);
    line.setAttribute("y1", pt1.y);
    line.setAttribute("x2", pt2.x);
    line.setAttribute("y2", pt2.y);

    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", "3");
    
    line.setAttribute("vector-effect", "non-scaling-stroke");

    svgElement.appendChild(line);

    window.game.lines.push(svgElement);

    const rect = new OpenSeadragon.Rect(0, 0, 1, 1);

    map.addOverlay({
        element: svgElement,
        location: rect,
        placement: 'TOP',
        checkVisibility: false
    });
}

function removelines() {
    for (const line of window.game.lines) {
        map.removeOverlay(line);
    }
    window.game.lines = [];
}

function getScore(distance) {
    distance -= 5;
    distance = Math.max(distance, 0);
    return 1000*Math.pow(Math.E, -Math.pow(distance/330, 1.25));
}