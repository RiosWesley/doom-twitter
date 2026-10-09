// Keyboard glue between the browser (often inside X's iframe) and SDL. Mouse look lives in mouse.js.

// SDL still reads the deprecated keyCode, so synthetic events need it.
const KEY_CODES = { ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39, Space: 32, ControlLeft: 17 };

// default.cfg binds one key per action (classic layout); these add the modern ones on top.
const ALIASES = { KeyW: "ArrowUp", KeyS: "ArrowDown", KeyE: "Space" };

// Game keys whose default action would scroll the X timeline around the iframe.
const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "PageUp", "PageDown", "Home", "End", "Tab"]);

export function press(code, down) {
    const event = new KeyboardEvent(down ? "keydown" : "keyup", { code, key: code, bubbles: true, cancelable: true });
    Object.defineProperty(event, "keyCode", { value: KEY_CODES[code] });
    Object.defineProperty(event, "which", { value: KEY_CODES[code] });
    window.dispatchEvent(event);
}

export function setupInput() {
    for (const type of ["keydown", "keyup"]) {
        window.addEventListener(
            type,
            (event) => {
                if (!event.isTrusted) return; // our own synthetic presses
                if (SCROLL_KEYS.has(event.code)) event.preventDefault();
                const alias = ALIASES[event.code];
                if (alias && !event.repeat) press(alias, type === "keydown");
            },
            true
        );
    }
}
