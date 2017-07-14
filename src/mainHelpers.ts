export function Updater(width: number, height: number, frame: number, ctx: CanvasRenderingContext2D, func: () => void) {
    let lastUpdate = +new Date();

    function update() {
        ctx.beginPath();
        ctx.clearRect(0, 0, width, height);

        func();

        const now = +new Date();
        const msTillNextFrame = (lastUpdate + frame) - now;
        const timeTillUpdate = msTillNextFrame > 0 ? msTillNextFrame : 0;

        lastUpdate = now;

        setTimeout(update, timeTillUpdate);
    }

    update()
}