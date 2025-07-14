class FloorClient extends RectClient {
    constructor(x, y, w) {
        super(x, y, w, 0);
    }

    draw() {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.w, this.y);
        ctx.stroke();
    }
}