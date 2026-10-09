// Mouse look. The engine pulls horizontal motion through takeMouseX() once per tic (I_ReadMouse in
// engine/src/i_input.c) instead of using SDL's, which SDL scales by the canvas' on-screen size.
//  - Pointer lock (full page, or wherever the browser grants it): raw 1:1 motion, like any PC shooter.
//  - No pointer lock (X's iframe refuses it): drag with the left button held, which also fires.

const DRAG_SPEED = 4; // a drag across a ~550px card turns about 100°

let pendingX = 0;

export function takeMouseX() {
    const whole = Math.trunc(pendingX);
    pendingX -= whole;
    return whole;
}

export function setupMouse() {
    window.addEventListener(
        "mousemove",
        (event) => {
            event.stopImmediatePropagation(); // SDL never sees motion, the engine reads takeMouseX()
            if (document.pointerLockElement) pendingX += event.movementX;
            else if (event.buttons & 1) pendingX += event.movementX * DRAG_SPEED;
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
    window.addEventListener("blur", () => (pendingX = 0));
}
