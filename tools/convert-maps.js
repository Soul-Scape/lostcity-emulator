/**
 * Converts lostcity-ref .jm2 map files to JSON format for the emulator.
 *
 * Usage: node tools/convert-maps.js <path-to-lostcity-ref>
 *
 * Reads:  <ref>/data/src/maps/*.jm2
 * Writes: data/maps/map_<X>_<Z>.json
 */
import fs from 'fs';
import path from 'path';

const refPath = process.argv[2] || 'C:\\Users\\go\\lostcity-ref';
const mapsDir = path.join(refPath, 'data', 'src', 'maps');
const outDir = path.join('data', 'maps');

if (!fs.existsSync(mapsDir)) {
    console.error(`[convert-maps] Maps directory not found: ${mapsDir}`);
    process.exit(1);
}

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

const files = fs.readdirSync(mapsDir).filter(f => f.endsWith('.jm2'));
console.log(`[convert-maps] Found ${files.length} .jm2 files`);

let totalTiles = 0;
let totalLocs = 0;
let totalNpcs = 0;
let totalObjs = 0;

for (const file of files) {
    const basename = path.basename(file, '.jm2');
    const [mapXStr, mapZStr] = basename.slice(1).split('_');
    const mapX = parseInt(mapXStr);
    const mapZ = parseInt(mapZStr);

    const raw = fs.readFileSync(path.join(mapsDir, file), 'utf-8')
        .replace(/\r/g, '')
        .split('\n')
        .filter(line => line.length > 0);

    const tiles = [];
    const locs = [];
    const npcs = [];
    const objs = [];

    let section = null;

    for (const line of raw) {
        if (line.startsWith('====')) {
            const match = line.match(/==== (\w+) ====/);
            if (match) section = match[1];
            continue;
        }

        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;

        const coordPart = line.substring(0, colonIdx).trim();
        const dataPart = line.substring(colonIdx + 1).trim();
        const coords = coordPart.split(' ').map(Number);

        if (section === 'MAP') {
            const [level, x, z] = coords;
            const parts = dataPart.split(' ');

            for (const part of parts) {
                if (!part) continue;
                const type = part[0];
                const info = part.slice(1);

                if (type === 'f') {
                    const flags = parseInt(info);
                    if (flags > 0) {
                        tiles.push({ x, z, level, collision: flags });
                    }
                }
            }
        } else if (section === 'LOC') {
            const [level, x, z] = coords;
            const parts = dataPart.split(' ');
            const id = parseInt(parts[0]);
            const shape = parts.length > 1 ? parseInt(parts[1]) : 10;
            const angle = parts.length > 2 ? parseInt(parts[2]) : 0;

            locs.push({ x, z, level, type: id, shape, angle });
        } else if (section === 'NPC') {
            const [level, x, z] = coords;
            const id = parseInt(dataPart.trim());

            npcs.push({ x, z, level, type: id });
        } else if (section === 'OBJ') {
            const [level, x, z] = coords;
            const parts = dataPart.split(' ');
            const id = parseInt(parts[0]);
            const count = parts.length > 1 ? parseInt(parts[1]) : 1;

            objs.push({ x, z, level, type: id, count });
        }
    }

    totalTiles += tiles.length;
    totalLocs += locs.length;
    totalNpcs += npcs.length;
    totalObjs += objs.length;

    const mapJson = {
        x: mapX,
        z: mapZ,
        tiles,
        locs,
        npcs,
        objs,
    };

    const outFile = path.join(outDir, `map_${mapX}_${mapZ}.json`);
    fs.writeFileSync(outFile, JSON.stringify(mapJson));
}

console.log(`[convert-maps] Done. Generated ${files.length} map files`);
console.log(`  Tiles with collision: ${totalTiles}`);
console.log(`  Locs (scenery):       ${totalLocs}`);
console.log(`  NPC spawns:           ${totalNpcs}`);
console.log(`  Obj spawns:           ${totalObjs}`);
console.log(`  Output: ${outDir}/`);
