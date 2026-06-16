async function listPanoramaFolders() {
    try {
        // Fetch the automated list file instead of the directory index
        const response = await fetch('./panoramas.json');
        if (!response.ok) throw new Error("Could not load panoramas.json");
        
        const folders = await response.json();
        return folders;
    } catch (e) {
        console.error("Failed to load panorama folder list:", e);
        return [];
    }
}

function loadNewPhotosphere() {
    const randomPanorama = window.chooseWeightedPanorama(window.game.weights, window.game.currentRound, window.game.seed);
    console.log("selected random panorama");
    window.loadPanorama(randomPanorama.name, randomPanorama, window.game.difficulty);
    console.log("loaded pano");
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

async function getPanoramaWeights() {
    // const allPanoramas = [];
    
    // let totalfolders = folders.length;
    // // Load all metadata
    // let i = 0;
    // for (const folderHref of folders) {
    //     i++;
    //     console.log("getting weights: "+i+"/"+totalfolders);
    //     try {
    //         const metaResponse = await fetch(`./${folderHref}/metadata.json`);
    //         if (metaResponse.ok) {
    //             const metadata = await metaResponse.json();
    //             allPanoramas.push({
    //                 name: folderHref,
    //                 X: metadata.X,
    //                 Y: metadata.Y,
    //                 Z: metadata.Z,
    //                 date: metadata.Date,
    //                 weight: 1
    //             });
    //         }
    //     } catch (e) {
    //         console.error(`Failed to fetch metadata for ${folderHref}:`, e);
    //     }
    // }
    
    // // Calculate weights based on proximity (from analyzelocations.py algorithm)
    // const processed = [];
    
    // for (const photosphere of allPanoramas) {
    //     for (const i of processed) {
    //         const currentday = (i.date === photosphere.date);
            
    //         // Calculate distance
    //         const xd = Math.pow(photosphere.X - i.X, 2);
    //         const zd = Math.pow(photosphere.Z - i.Z, 2);
    //         const vmc = 2;
    //         const dist = Math.sqrt(Math.pow(Math.sqrt(xd + zd), 2) + Math.pow(vmc * (photosphere.Y - i.Y), 2));
            
    //         let mult = 1;
    //         if (dist < 20) {
    //             mult = Math.max(0, (dist - 5) / 15);
    //         }
            
    //         if (currentday) {
    //             photosphere.weight *= Math.sqrt(mult);
    //             i.weight *= Math.sqrt(mult);
    //         } else {
    //             i.weight *= mult;
    //         }
    //     }
        
    //     processed.push(photosphere);
    // }

    // console.log(processed[0].name);

    let loaded = await fetch(`./weights.json`);
    let data = await loaded.json();
    console.log(data[0].name);
    
    return data;
}