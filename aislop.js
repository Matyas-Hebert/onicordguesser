window.addEventListener('DOMContentLoaded', () => {

    window.setMapFullscreen = function(enable) {
        const mapViewport = document.getElementById('map-viewport');
        if (!mapViewport) {
            return;
        }
        mapViewport.classList.toggle('fullscreen', Boolean(enable));
    };

    window.showGuessResult = function(correctInfo) {
        window.setMapFullscreen(true);

        const correctpin = document.createElement('div');
        correctpin.className = 'correct-pin';

        console.log("ci: ", correctInfo);
        let mapcoords = window.translateRealToMap({x: correctInfo.X, z: correctInfo.Z});
        console.log(mapcoords);
        const correctpoint = new OpenSeadragon.Point(mapcoords.x, mapcoords.z);
        mapViewer.addOverlay(correctpin, correctpoint, OpenSeadragon.Placement.CENTER);
    }

    window.setMapPins = function(items) {
        removeAllMapPins();
        if (!Array.isArray(items) || items.length === 0) {
            return;
        }

        const weights = items.map(item => typeof item.weight === 'number' ? item.weight : 1);
        const maxWeight = Math.max(...weights, 1);
        const minWeight = Math.min(...weights, 0);
        const range = maxWeight - minWeight || 1;

        for (const item of items) {
            const weight = typeof item.weight === 'number' ? item.weight : 1;
            let alpha = (weight - minWeight) / range;
            alpha = Math.min(1, Math.max(0.2, alpha * 0.9 + 0.1));

            const coords = item.coords || (item.X != null && item.Z != null ? { x: item.X, y: item.Z } : null);
            if (!coords) {
                continue;
            }

            if (typeof window.translateRealToMap !== 'function') {
                continue;
            }

            let mapPoint;
            try {
                mapPoint = window.translateRealToMap(coords);
            } catch (e) {
                continue;
            }

            if (!mapPoint || Number.isNaN(mapPoint.x) || Number.isNaN(mapPoint.z)) {
                continue;
            }

            const pin = document.createElement('div');
            pin.className = 'map-pin';
            pin.style.opacity = String(alpha);
            pin.title = item.Text || item.text || `weight: ${weight}`;
            pin.style.cursor = 'pointer';

            const panoramaPath = item.name || item.path || item.folder || item.location || null;
            if (panoramaPath) {
                pin.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.loadPanorama(panoramaPath, item, window.game.difficulty);
                    console.log("loading", panoramaPath);
                });
            }

            const point = new OpenSeadragon.Point(mapPoint.x, mapPoint.y);
            const placement = OpenSeadragon.Placement.CENTER;
            mapViewer.addOverlay(pin, point, placement);
        }
    };

    mapViewer.addHandler('canvas-click', function(event) {
        try {
            const original = event.originalEvent || {};
            if (typeof original.button !== 'undefined' && original.button !== 0) {
                return;
            }

            const duration = performance.now() - clickFilter.startTime;
            if (clickFilter.moved || duration > clickFilter.maxDuration) {
                return;
            }

            const webPoint = event.position;
            const viewportPoint = mapViewer.viewport.viewerElementToViewportCoordinates(webPoint);
            const imagePoint = mapViewer.viewport.viewportToImageCoordinates(viewportPoint);

            const existing = document.getElementById('map-pin');
            if (existing) {
                try { mapViewer.removeOverlay(existing); } catch (e) {}
                existing.remove();
            }

            const pin = document.createElement('div');
            pin.id = 'map-pin';
            pin.className = 'map-pin';
            pin.title = `Guess at (${imagePoint.x.toFixed(1)}, ${imagePoint.y.toFixed(1)})`;

            const vpPoint = mapViewer.viewport.imageToViewportCoordinates(new OpenSeadragon.Point(imagePoint.x, imagePoint.y));
            mapViewer.addOverlay(pin, vpPoint);
            window.currentGuessViewportPoint = vpPoint;
            removeGuessLine();
            window.setGuessButtonEnabled(true);
            if (typeof window.translateMapToReal === 'function') {
                try {
                    const real = window.translateMapToReal(viewportPoint);
                    console.log(viewportPoint);
                    console.log('Real coords:', real);
                } catch (e) {
                    console.warn('translateMapToReal failed:', e);
                }
            }
        } catch (err) {
            console.error('Error handling map click', err);
        }
    });
    
    const guessBtn = document.getElementById('guess-button');
    if (guessBtn) {
        guessBtn.addEventListener('click', async () => {
            if (typeof window.guess === 'function') {
                try {
                    await window.guess();
                } catch (e) {
                    console.error('Error in guess():', e);
                }
            }
        });
        window.setGuessButtonEnabled(false);
    }
});

window.listPanoramaFolders = listPanoramaFolders;
window.getPanoramaWeights = getPanoramaWeights;
window.chooseWeightedPanorama = chooseWeightedPanorama;

window.guess = async function() {
    const guessPin = document.getElementById('map-pin');

    window.setGuessButtonEnabled(false);

    const roundLabel = document.getElementById('current-round');

    window.game.incrementRound();
    roundLabel.textContent = String(gameState.currentRound);

    window.showGuessResult(window.currentPanoramaInfo);
    const folders = await window.listPanoramaFolders();
    const weights = await window.getPanoramaWeights(folders);
    const next = window.chooseWeightedPanorama(weights, gameState.currentRound, gameState.seed);
    if (next) {
        window.loadPanorama(next.name, next, window.game.difficulty);
    }
    return next;
};