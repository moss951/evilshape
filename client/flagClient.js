class FlagClient extends CircleClient {
    constructor(x, y) {
        super(x, y, 25);
        this.lineDashOffset = 0;
        this.rotateSpeed = 1;
    }

    draw() {
        ctx.setLineDash([5, 5]);
        this.lineDashOffset += this.rotateSpeed;
        ctx.lineDashOffset = this.lineDashOffset;

        ctx.beginPath();
        ctx.strokeStyle = "limegreen";
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.lineDashOffset = 0;
    }
}