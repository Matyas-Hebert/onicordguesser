async function setUpLabels() {
    const min = [0, 1.5, 5, 12, 20, 40, 70];
    const max = [2, 10, 30, 45, 100, 180, 10000];

    const labelsResponse = await fetch('labelssetup.json');
    const labelsJSONData = await labelsResponse.json();
    console.log('labels setup:', labelsJSONData);

    const labels = (labelsJSONData.Labels || []).map(labelsJSONData => ({
        coords: { x: labelsJSONData.X, z: labelsJSONData.Z },
        minZoom: min[labelsJSONData.Grade],
        maxZoom: max[labelsJSONData.Grade],
        text: labelsJSONData.Text
    }));

    console.log('created labels const');

    setMapOverlayLabels(labels);

    console.log('map overlay lables setup');
}

function setMapOverlayLabels(labels) {
    removeAllMapTextOverlays();

    console.log('removed map text overlay');

    labelsData = labels.map(labelData => ({
         data: {
             coords: labelData.coords || { x: labelData.X, z: labelData.Z },
             minZoom: labelData.minZoom ?? 0,
             maxZoom: labelData.maxZoom ?? Infinity,
             text: labelData.text ?? labelData.Text ?? ''
         },
         element: createMapTextElement(labelData.text ?? labelData.Text ?? ''),
         added: false
    }));

    console.log('mapped');

    updateMapTextOverlays();

    console.log('overlay updated');
};

function updateMapTextOverlays() {
    const currentZoom = map.viewport.getZoom();

    for (const entry of labelsData) {
        const { data, element } = entry;
        const { coords, minZoom = 0, maxZoom = Infinity, text = '' } = data;

        if (currentZoom < minZoom || currentZoom > maxZoom) {
            if (entry.added) {
                map.removeOverlay(element);
                entry.added = false;
            }
            element.style.display = 'none';
            continue;
        }

        let mapPoint;
        mapPoint = window.translateRealToMap(coords);

        element.textContent = text;
        const point = new OpenSeadragon.Point(mapPoint.x, mapPoint.z);
        const placement = OpenSeadragon.Placement.CENTER;

        if (!entry.added) {
            map.addOverlay(element, point, placement);
            entry.added = true;
        } else if (typeof map.updateOverlay === 'function') {
            map.updateOverlay(element, point, placement);
        }

        element.style.display = 'block';
    }
}

function removeAllMapTextOverlays() {
    for (const entry of labelsData) {
        map.removeOverlay(entry.element);
    }
    labelsData = [];
}

function createMapTextElement(labelText) {
    const el = document.createElement('div');
    el.className = 'map-text-overlay';
    el.textContent = labelText || '';
    el.style.display = 'none';
    return el;
}