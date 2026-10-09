// Mouse look, fed to the engine through controls.js instead of SDL (which scales motion by the canvas' on-screen size).
//  - Pointer lock (full page, or wherever the browser grants it): raw 1:1 motion, like any PC shooter.
//  - No pointer lock (X's iframe refuses it): drag with the left button held, which also fires.
import { addTurn, resetTurn } from "./controls.js";

const DRAG_SPEED = 4; // a drag across a ~550px card turns about 100°

export function setupMouse() {
    window.addEventListener(
        "mousemove",
        (event) => {
            event.stopImmediatePropagation(); // SDL never sees motion
            if (document.pointerLockElement) addTurn(event.movementX);
            else if (event.buttons & 1) addTurn(event.movementX * DRAG_SPEED);
        },
        true
    );

    // Unlocked, the wheel scrolls the timeline (SDL would swallow it); locked, it switches weapons (extra.cfg).
    window.addEventListener(
        "wheel",
        (event) => {
            if (!document.pointerLockElement) event.stopImmediatePropagation();
        },
        true
    );

    // Motion left over when focus is lost would otherwise jerk the view on return.
    window.addEventListener("blur", resetTurn);
}
