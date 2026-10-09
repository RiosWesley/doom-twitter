import { press } from "./input.js";
import { addTurn } from "./mouse.js";
import { setupJoystick } from "./joystick.js";

// Phone controls, shown by CSS on coarse pointers:
//  - left half: floating joystick to walk and strafe
//  - right half: drag to turn, like mouse look
//  - FIRE (dragging on it turns too, to aim while shooting), USE and next weapon

const MOVE_KEYS = { up: "ArrowUp", down: "ArrowDown", left: "KeyA", right: "KeyD" }; // A/D strafe in default.cfg
const TURN_SPEED = 10; // engine turn units per px dragged: a swipe across half a phone card turns about 80°

export const TOUCH_MARKUP = `
    <div class="touch">
        <div class="move-zone"><div class="stick"><div class="knob"></div></div></div>
        <div class="look-zone"></div>
        <div class="actions">
            <button data-key="BracketRight" class="weapon" aria-label="Next weapon">WPN</button>
            <button data-key="Space" class="use">USE</button>
            <button data-key="ControlLeft" class="fire">FIRE</button>
        </div>
    </div>`;

export function setupTouch(root) {
    const held = new Set();
    setupJoystick(root.querySelector(".move-zone"), root.querySelector(".stick"), root.querySelector(".knob"), (directions) => {
        const wanted = new Set(directions.map((direction) => MOVE_KEYS[direction]));
        for (const key of held) if (!wanted.has(key)) press(key, false), held.delete(key);
        for (const key of wanted) if (!held.has(key)) press(key, true), held.add(key);
    });

    dragToTurn(root.querySelector(".look-zone"));
    dragToTurn(root.querySelector(".touch .fire"));
    for (const button of root.querySelectorAll(".touch [data-key]")) holdKey(button);
}

// The button's key stays down for as long as it is touched.
function holdKey(button) {
    const key = button.dataset.key;
    button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        press(key, true);
    });
    for (const type of ["pointerup", "pointercancel"]) button.addEventListener(type, () => press(key, false));
}

// Horizontal finger motion feeds the same turn accumulator as the mouse.
function dragToTurn(element) {
    const lastX = new Map();
    element.addEventListener("pointerdown", (event) => {
        element.setPointerCapture(event.pointerId);
        lastX.set(event.pointerId, event.clientX);
    });
    element.addEventListener("pointermove", (event) => {
        if (!lastX.has(event.pointerId)) return;
        addTurn((event.clientX - lastX.get(event.pointerId)) * TURN_SPEED);
        lastX.set(event.pointerId, event.clientX);
    });
    for (const type of ["pointerup", "pointercancel"]) element.addEventListener(type, (event) => lastX.delete(event.pointerId));
}
