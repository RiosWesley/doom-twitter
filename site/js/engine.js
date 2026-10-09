// Boots the Emscripten build of Chocolate Doom (engine/) on a canvas.
import { takeMouseX } from "./mouse.js";

// Straight into E1M1 on "Hurt Me Plenty": in a tweet, every second before the action costs players.
const ARGS = ["-iwad", "doom1.wad", "-window", "-nogui", "-config", "default.cfg", "-extraconfig", "extra.cfg", "-skill", "3", "-warp", "1", "1"];

// files: { "doom1.wad": ArrayBuffer, ... } written to the in-memory filesystem before main() runs.
// audioContext must be created inside the click handler, or Safari keeps the game muted.
export function startDoom({ canvas, wasm, files, audioContext, onStart, onExit }) {
    window.Module = {
        canvas,
        wasmBinary: wasm,
        noInitialRun: true,
        SDL2: { audioContext }, // SDL's audio backend reuses this instead of creating its own
        takeMouseX, // polled by the engine every tic
        preRun: [
            () => {
                for (const [name, data] of Object.entries(files)) window.Module.FS.writeFile(name, new Uint8Array(data));
            },
        ],
        onRuntimeInitialized: () => {
            onStart();
            window.callMain(ARGS); // global defined by the classic Emscripten script
        },
        onExit,
        print: (text) => console.log(text),
        printErr: (text) => console.error(text),
    };
    const script = document.createElement("script");
    script.src = "/websockets-doom.js";
    document.body.append(script);
}
