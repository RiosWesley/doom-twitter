// Floating analog thumbstick: wherever the thumb lands in `zone` becomes the centre, and the offset from it is
// reported as x/y in -1..1 (y grows downwards), zero inside a small deadzone and full at RADIUS.

const DEADZONE = 8; // px of travel ignored, so resting a thumb doesn't move
const RADIUS = 48; // px of travel for full deflection, also how far the knob moves

export function setupJoystick(zone, base, knob, onChange) {
    let pointer = null;
    let originX = 0;
    let originY = 0;

    const update = (x, y) => {
        const dx = x - originX;
        const dy = y - originY;
        const length = Math.hypot(dx, dy);
        const clamp = length > RADIUS ? RADIUS / length : 1;
        knob.style.transform = `translate(${dx * clamp}px, ${dy * clamp}px)`;
        if (length < DEADZONE) return onChange(0, 0);
        const amount = Math.min(1, (length - DEADZONE) / (RADIUS - DEADZONE));
        onChange((dx / length) * amount, (dy / length) * amount);
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
            onChange(0, 0);
        });
    }
}
