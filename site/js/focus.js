// The engine pauses itself while the window is unfocused (engine/src/doom/g_game.c). This shows a resume prompt
// meanwhile, and treats scrolling the tweet out of view as losing focus: wheel-scrolling X never blurs the iframe.
export function setupFocus(root, canvas, prompt) {
    const resume = () => {
        canvas.focus();
        // The iframe may still hold real focus after an out-of-view pause, so no native focus event would come.
        window.dispatchEvent(new FocusEvent("focus"));
    };

    window.addEventListener("blur", () => (prompt.hidden = false));
    window.addEventListener("focus", () => (prompt.hidden = true));
    prompt.addEventListener("click", resume);

    new IntersectionObserver(
        ([entry]) => {
            if (entry.intersectionRatio < 0.5 && prompt.hidden) window.dispatchEvent(new FocusEvent("blur"));
        },
        { threshold: 0.5 }
    ).observe(root);

    resume();
}
