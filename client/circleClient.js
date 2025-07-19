class CircleClient extends ShapeClient {
    constructor(x, y, r) {
        super(x, y);
        this.r = r;
    }

    draw() {
        ctx.setLineDash([]);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.stroke();
    }
}