class FlagClient extends CircleClient {
    constructor(x, y) {
        super(x, y, 25);
    }

    draw() {
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.strokeStyle = "limegreen";
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.stroke();
    }
}