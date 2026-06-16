function createMap(){
    return OpenSeadragon({
        id: 'map-viewport',
        prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/',
        tileSources: './tiling/my_tiles.dzi',
        showNavigationControl: false,
        gestureSettingsMouse: {
            clickToZoom: false
        },
        maxZoomLevel: 300,
        maxZoomPixelRatio: Infinity,
        canvasImageSmoothingEnabled: false,
        pixelRatio: window.devicePixelRatio || 1,
        subPixelRenderAlign: false,
        minPixelRatio: 1,
        blendTime: 0,
        alwaysBlend: false
    });
}

function setupMapHandlers(map){
    console.log("setting up handlers");
    map.addHandler('zoom', () => {
        updateMapTextOverlays();
    });
    map.addHandler('pan', () => {
        updateMapTextOverlays();
    });

    map.addHandler('canvas-press', (e) => {
        window.game.mousedown = true;
        window.game.mousedownpos = e.position;
    });

    map.addHandler('canvas-release', (e) => {
        if (!window.game.mousedown) return;
        if (window.game.guessed) return;
        const distance = getDistance(window.game.mousedownpos, e.position);
        if (distance < 8) {
            const viewportPoint = map.viewport.viewerElementToViewportCoordinates(e.position);
            console.log(viewportPoint);
            console.log(translateMapToReal({x: viewportPoint.x, z: viewportPoint.y}));
            removePins(map);
            if (window.game.yourGuesses.length >= window.game.currentRound){
                window.game.yourGuesses[window.game.currentRound - 1] = { x: viewportPoint.x, z: viewportPoint.y };
            }
            else{
                window.game.yourGuesses.push({ x: viewportPoint.x, z: viewportPoint.y });
            }
            addPin(map, { x: viewportPoint.x, y: viewportPoint.y });
            setGuessButtonEnabled(true);
        }
        window.game.mousedown = false;
    });
}

function resetzoom() {
    map.viewport.zoomTo(0.5);
    map.viewport.panTo(new OpenSeadragon.Point(0.5, 0.5));
}

function getDistance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function getDistancexz(a, b) {
    return Math.hypot(a.x - b.x, a.z - b.z);
}

function addPin(map, coords, color = '#ff4d4d') {
    const pin = document.createElement('div');
    pin.style.width = '12px';
    pin.style.height = '12px';
    pin.style.background = color;
    pin.style.border = '2px solid white';
    pin.style.borderRadius = '50%';
    pin.style.boxShadow = '0 0 6px rgba(0,0,0,0.6)';
    pin.style.transform = 'translate(-50%, -50%)';
    pin.style.zIndex = 9999;

    pinsData.push(pin);
    
    const point = new OpenSeadragon.Point(coords.x, coords.y);
    map.addOverlay(pin, point, OpenSeadragon.Placement.CENTER);
    
    return pin;
}

function removePins(map){
    for (const pinEntry of pinsData) {
        map.removeOverlay(pinEntry);
    }
}