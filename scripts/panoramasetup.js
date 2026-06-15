async function listPanoramaFolders() {
    const response = await fetch('panoramas/');
    const text = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const links = doc.querySelectorAll('a');
    
    const folders = [];
    links.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && href !== '/' && href !== '/panoramas') {
            folders.push(href);
        }
    });
    
    return folders;
}

function loadNewPhotosphere() {
    const randomPanorama = window.chooseWeightedPanorama(window.game.weights, window.game.currentRound, window.game.seed);
    window.loadPanorama(randomPanorama.name, randomPanorama, window.game.difficulty);
    window.game.currentPan = randomPanorama;
}

function chooseWeightedPanorama(items, round = 1, seed = '') {
    if (!Array.isArray(items) || items.length === 0) {
        return null;
    }

    const totalWeight = items.reduce((sum, item) => sum + (typeof item.weight === 'number' ? item.weight : 0), 0);
    const normalizedTotal = totalWeight > 0 ? totalWeight : items.length;
    const rand = seededRandom(seed, round);
    const threshold = rand * normalizedTotal;

    let running = 0;
    for (const item of items) {
        const weight = totalWeight > 0 ? (typeof item.weight === 'number' ? item.weight : 0) : 1;
        running += weight;
        if (threshold < running) {
            return item;
        }
    }

    return items[items.length - 1];
}

async function getPanoramaWeights(folders) {
    const allPanoramas = [];
    
    // Load all metadata
    for (const folderHref of folders) {
        try {
            const metaResponse = await fetch(`${folderHref}/metadata.json`);
            if (metaResponse.ok) {
                const metadata = await metaResponse.json();
                allPanoramas.push({
                    name: folderHref,
                    X: metadata.X,
                    Y: metadata.Y,
                    Z: metadata.Z,
                    date: metadata.Date,
                    weight: 1
                });
            }
        } catch (e) {
            console.error(`Failed to fetch metadata for ${folderHref}:`, e);
        }
    }
    
    // Calculate weights based on proximity (from analyzelocations.py algorithm)
    const processed = [];
    
    for (const photosphere of allPanoramas) {
        for (const i of processed) {
            const currentday = (i.date === photosphere.date);
            
            // Calculate distance
            const xd = Math.pow(photosphere.X - i.X, 2);
            const zd = Math.pow(photosphere.Z - i.Z, 2);
            const vmc = 2;
            const dist = Math.sqrt(Math.pow(Math.sqrt(xd + zd), 2) + Math.pow(vmc * (photosphere.Y - i.Y), 2));
            
            let mult = 1;
            if (dist < 20) {
                mult = Math.max(0, (dist - 5) / 15);
            }
            
            if (currentday) {
                photosphere.weight *= Math.sqrt(mult);
                i.weight *= Math.sqrt(mult);
            } else {
                i.weight *= mult;
            }
        }
        
        processed.push(photosphere);
    }
    
    return processed;
}