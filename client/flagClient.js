class FlagClient extends CircleClient {
    constructor(x, y) {
        super(x, y, 25);
    }

    draw() {
        ctx.beginPath();
        ctx.strokeStyle = "green";
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.stroke();
    }
}