// Mouse look, fed to the engine through controls.js instead of SDL (which scales motion by the canvas' on-screen size).
//  - Pointer lock (full page, or wherever the browser grants it): raw 1:1 motion, like any PC shooter.
//  - No pointer lock (X's iframe refuses it): plain hovering turns, and resting the cursor near the left or right
//    edge keeps turning that way, so a full turn never needs the cursor to leave the frame.
import { addTurn, resetTurn, stick } from "./controls.js";

const HOVER_SPEED = 4; // moving across a ~550px card turns about 100°
const EDGE = 0.2; // outer fifth of the frame on each side...
const EDGE_SPEED = 0.6; // ...ramps up to 60% of the arrow keys' fast turn (about 150°/s) at the very edge

// Phones also fire mousemove after taps (at the tap spot), which must not steer; only a real hovering mouse may.
const CAN_HOVER = matchMedia("(hover: hover)").matches;

export function setupMouse() {
    window.addEventListener(
        "mousemove",
        (event) => {
            event.stopImmediatePropagation(); // SDL never sees motion
            if (document.pointerLockElement) {
                stick.x = 0;
                addTurn(event.movementX);
            } else if (CAN_HOVER) {
                addTurn(event.movementX * HOVER_SPEED);
                stick.x = edgeTurn(event.clientX / window.innerWidth);
            }
        },
        true
    );
    document.documentElement.addEventListener("mouseleave", stopTurning);

    // Unlocked, the wheel scrolls the timeline (SDL would swallow it); locked, it switches weapons (extra.cfg).
    window.addEventListener(
        "wheel",
        (event) => {
            if (!document.pointerLockElement) event.stopImmediatePropagation();
        },
        true
    );

    window.addEventListener("blur", stopTurning);
}

// x runs 0..1 across the frame: 0 in the middle, ±EDGE_SPEED at the edges (stick.x > 0 turns right).
function edgeTurn(x) {
    const depth = Math.max(0, EDGE - Math.min(x, 1 - x)) / EDGE;
    return Math.sign(x - 0.5) * depth * EDGE_SPEED;
}

// Motion left over when focus is lost would otherwise jerk the view on return.
function stopTurning() {
    resetTurn();
    stick.x = 0;
}
