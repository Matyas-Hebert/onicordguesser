function setMapReferences(refA, refB) {
    const x1 = refA.map.x, y1 = refA.map.y;
    const x2 = refB.map.x, y2 = refB.map.y;
    const X1 = refA.real.x, Y1 = refA.real.y;
    const X2 = refB.real.x, Y2 = refB.real.y;

    const transform = {};
    transform.a = (X2 - X1) / (x2 - x1);
    transform.b = X1 - transform.a * x1;

    transform.c = (Y2 - Y1) / (y2 - y1);
    transform.d = Y1 - transform.c * y1;

    window._mapTransform = transform;
    return transform;
};

function translateMapToReal(mapPoint) {
    const t = window._mapTransform;
    const rx = t.a * mapPoint.x + t.b;
    const rz = t.c * mapPoint.z + t.d;
    return { x: rx, z: rz };
};

function translateRealToMap(realPoint) {
    const t = window._mapTransform;
    const mx = (realPoint.x - t.b) / t.a;
    const mz = (realPoint.z - t.d) / t.c;
    return { x: mx, z: mz };
};