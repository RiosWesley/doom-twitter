// Player shell shared by the share page and the X embed: click to play, download, boot, focus handling.
import { fetchAll } from "./loader.js";
import { startDoom } from "./engine.js";
import { setupInput } from "./input.js";
import { setupMouse } from "./mouse.js";
import { setupFocus } from "./focus.js";
import { TOUCH_MARKUP, setupTouch } from "./touch.js";

const FILES = ["doom1.wad", "default.cfg", "extra.cfg"];

const root = document.getElementById("doom");
const fullUrl = root.dataset.fullUrl;
root.innerHTML = `
    <canvas id="canvas" class="screen" tabindex="0" oncontextmenu="return false"></canvas>
    ${TOUCH_MARKUP}
    <button class="cover" type="button"><span class="label">CLICK TO PLAY</span></button>
    <button class="paused" type="button" hidden><span class="label">PAUSED · CLICK TO RESUME</span></button>
    ${fullUrl ? `<a class="full" href="${fullUrl}" target="_blank" rel="noopener">open full screen ↗</a>` : ""}`;

const canvas = root.querySelector("#canvas"); // SDL looks the canvas up by this exact id
const cover = root.querySelector(".cover");
const label = cover.querySelector(".label");

cover.addEventListener("click", play, { once: true });

async function play() {
    const audioContext = new AudioContext();
    audioContext.resume();
    label.textContent = "LOADING…";
    try {
        const [wasm, ...data] = await fetchAll(["/websockets-doom.wasm", ...FILES.map((f) => "/" + f)], (bytes) => {
            label.textContent = `LOADING ${(bytes / 1e6).toFixed(1)} MB`;
        });
        setupInput();
        setupMouse();
        setupTouch(root);
        startDoom({
            canvas,
            wasm,
            files: Object.fromEntries(FILES.map((name, i) => [name, data[i]])),
            audioContext,
            onStart: () => {
                cover.hidden = true;
                setupFocus(root, canvas, root.querySelector(".paused"));
            },
            onExit: () => {
                // Quitting from the menu ends the Emscripten runtime; a reload is the only way back in.
                label.textContent = "CLICK TO PLAY AGAIN";
                cover.hidden = false;
                cover.addEventListener("click", () => location.reload(), { once: true });
            },
        });
    } catch (error) {
        console.error(error);
        label.textContent = "FAILED TO LOAD · CLICK TO RETRY";
        cover.addEventListener("click", () => location.reload(), { once: true });
    }
}
