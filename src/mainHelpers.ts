export function Updater(width: number, height: number, ctx: CanvasRenderingContext2D, func: () => void) {

    function update() {
        ctx.beginPath();
        ctx.clearRect(0, 0, width, height);

        func();
        requestAnimationFrame(update);
    }

    update();
}