// State the engine polls every tic: Module.takeMouseX (I_ReadMouse in engine/src/i_input.c) and Module.stick
// (G_BuildTiccmd in engine/src/doom/g_game.c). mouse.js and touch.js feed it.

// Analog thumbstick, each axis -1..1: y < 0 walks forward, x > 0 turns right.
export const stick = { x: 0, y: 0 };

let pendingTurn = 0; // in engine turn units (1 = one mouse pixel at default sensitivity)

export function addTurn(units) {
    pendingTurn += units;
}

export function resetTurn() {
    pendingTurn = 0;
}

export function takeMouseX() {
    const whole = Math.trunc(pendingTurn);
    pendingTurn -= whole;
    return whole;
}
