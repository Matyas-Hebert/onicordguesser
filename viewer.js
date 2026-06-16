import { Viewer } from '@photo-sphere-viewer/core';
import { CubemapAdapter } from '@photo-sphere-viewer/cubemap-adapter';

let viewer = null;

function createPanoramaInfoElement() {
    let info = document.getElementById('panorama-info');
    if (!info) {
        info = document.createElement('div');
        info.id = 'panorama-info';
        info.style.display = 'none';
        document.body.appendChild(info);
    }
    return info;
}

window.updatePanoramaInfo = function(info) {
    const el = createPanoramaInfoElement();
    if (!info || (info.weight == null && !info.date)) {
        el.style.display = 'none';
        return;
    }
    const weightText = info.weight != null ? Number(info.weight).toFixed(2) : 'N/A';
    const dateText = info.date != null ? info.date : 'unknown';
    el.innerHTML = `<strong>weight:</strong> ${weightText}<br><strong>date:</strong> ${dateText}`;
    el.style.display = 'block';
};

window.setPanoramaInteractions = function(enabled) {
    if (!viewer) return;

    if (enabled) {
        // Unlock everything back to normal
        viewer.setOptions({
            mousewheel: true,
            mousemove: true,
            touchmove: true
        });
    } else {
        // Lock it down completely! No dragging, no mouse wheel zooming, no touch swipe
        viewer.setOptions({
            mousewheel: false,
            mousemove: false,
            touchmove: false
        });
    }
};

// 1. Set a random horizontal angle (Full 360-degree circle)
window.randomizePanoramaYaw = function() {
    if (!viewer) return;
    const randomYaw = Math.random() * 2 * Math.PI;
    
    viewer.rotate({
        yaw: randomYaw,
        pitch: viewer.getPosition().pitch // Keep current pitch unchanged
    });
};

// 2. Set a random vertical angle (Slightly restricted so they don't look dead down/up)
window.randomizePanoramaPitch = function() {
    if (!viewer) return;
    const randomPitch = (Math.random() * 2.4) - 1.2; 
    
    viewer.rotate({
        yaw: viewer.getPosition().yaw, // Keep current yaw unchanged
        pitch: randomPitch
    });
};

// 3. Set a random zoom level between 0% and 50%
window.randomizePanoramaZoom = function(minz, maxz) {
    if (!viewer) return;
    const randomZoom = Math.floor(Math.random() * (maxz-minz))+minz;
    
    viewer.zoom(randomZoom);
};

window.loadPanorama = function(path, info, diff) {
    if (viewer) {
        viewer.destroy();
    }

    console.log("destroyed viewer");

    if (diff == 1){
        viewer = new Viewer({
            container: document.querySelector('#photosphere-container'),
            adapter: CubemapAdapter,
            panorama: {
                left:   path+'\\WEST.jpg',
                front:  path+'\\NORTH.jpg',
                right:  path+'\\EAST.jpg',
                back:   path+'\\SOUTH.jpg',
                top:    path+'\\UP.jpg',
                bottom: path+'\\DOWN.jpg'
            },
            defaultZoomLvl: 0,
            navbar: ['zoom', 'move', 'fullscreen']
        });
        console.log("created viewer");
    }
    else{
        viewer = new Viewer({
            container: document.querySelector('#photosphere-container'),
            adapter: CubemapAdapter,
            panorama: {
                left:   path+'\\WEST.jpg',
                front:  path+'\\NORTH.jpg',
                right:  path+'\\EAST.jpg',
                back:   path+'\\SOUTH.jpg',
                top:    path+'\\UP.jpg',
                bottom: path+'\\DOWN.jpg'
            },
            defaultZoomLvl: 0,
            navbar: false
        });
        console.log("created viewer");
    }

    window.currentPanoramaInfo = info || null;
    window.updatePanoramaInfo(info);

    console.log("updated info");

    console.log("the difficulty is: ", diff);
    if (diff == 1){
        window.setPanoramaInteractions(true);
    }
    if (diff == 2){
        window.randomizePanoramaPitch();
        window.randomizePanoramaYaw();
        window.setPanoramaInteractions(false);
    }
    if (diff == 3){
        window.randomizePanoramaPitch();
        window.randomizePanoramaYaw();
        window.randomizePanoramaZoom(30, 100);
        window.setPanoramaInteractions(false);
    }
    if (diff == 4){
        window.randomizePanoramaPitch();
        window.randomizePanoramaYaw();
        window.randomizePanoramaZoom(100, 100);
        window.setPanoramaInteractions(false);
    }

    console.log("set up done");
};

window.updaterestrictions = function(diff) {
    if (diff == 1){
        window.setPanoramaInteractions(true);
    }
    if (diff == 2){
        window.randomizePanoramaPitch();
        window.randomizePanoramaYaw();
        window.setPanoramaInteractions(false);
    }
    if (diff == 3){
        window.randomizePanoramaPitch();
        window.randomizePanoramaYaw();
        window.randomizePanoramaZoom(30, 100);
        window.setPanoramaInteractions(false);
    }
    if (diff == 4){
        window.randomizePanoramaPitch();
        window.randomizePanoramaYaw();
        window.randomizePanoramaZoom(100, 100);
        window.setPanoramaInteractions(false);
    }
}