// Floating thumbstick: wherever the thumb lands in `zone` becomes the centre, and the direction it is pushed picks
// one of eight sectors. Doom's keyboard movement is digital anyway, so the output is a list of held directions.

const DEADZONE = 12; // px of travel before anything is held
const RADIUS = 40; // px the knob can travel visually
const SECTORS = [["right"], ["down", "right"], ["down"], ["down", "left"], ["left"], ["up", "left"], ["up"], ["up", "right"]];

export function setupJoystick(zone, base, knob, onDirections) {
    let pointer = null;
    let originX = 0;
    let originY = 0;

    const update = (x, y) => {
        const dx = x - originX;
        const dy = y - originY;
        const length = Math.hypot(dx, dy);
        const clamp = length > RADIUS ? RADIUS / length : 1;
        knob.style.transform = `translate(${dx * clamp}px, ${dy * clamp}px)`;
        if (length < DEADZONE) return onDirections([]);
        onDirections(SECTORS[(Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8]); // y grows downwards
    };

    zone.addEventListener("pointerdown", (event) => {
        if (pointer !== null) return;
        pointer = event.pointerId;
        zone.setPointerCapture(pointer);
        const rect = zone.getBoundingClientRect();
        originX = event.clientX;
        originY = event.clientY;
        base.style.left = `${originX - rect.left}px`;
        base.style.top = `${originY - rect.top}px`;
        base.classList.add("active");
        update(originX, originY);
    });
    zone.addEventListener("pointermove", (event) => {
        if (event.pointerId === pointer) update(event.clientX, event.clientY);
    });
    for (const type of ["pointerup", "pointercancel"]) {
        zone.addEventListener(type, (event) => {
            if (event.pointerId !== pointer) return;
            pointer = null;
            base.classList.remove("active");
            base.style.left = base.style.top = knob.style.transform = "";
            onDirections([]);
        });
    }
}
