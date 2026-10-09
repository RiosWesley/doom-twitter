import { press } from "./input.js";

// On-screen controls for phones (shown by CSS on coarse pointers). Each button holds its key while touched.
export const TOUCH_MARKUP = `
    <div class="touch">
        <div class="dpad">
            <button data-key="ArrowUp" aria-label="Forward">▲</button>
            <button data-key="ArrowLeft" aria-label="Turn left">◀</button>
            <button data-key="ArrowRight" aria-label="Turn right">▶</button>
            <button data-key="ArrowDown" aria-label="Back">▼</button>
        </div>
        <div class="actions">
            <button data-key="Space">USE</button>
            <button data-key="ControlLeft">FIRE</button>
        </div>
    </div>`;

export function setupTouch(root) {
    for (const button of root.querySelectorAll(".touch [data-key]")) {
        const key = button.dataset.key;
        button.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            button.setPointerCapture(event.pointerId);
            press(key, true);
        });
        for (const type of ["pointerup", "pointercancel"]) button.addEventListener(type, () => press(key, false));
    }
}
