class FlagClient extends CircleClient {
    constructor(x, y) {
        super(x, y, 25);
        this.lineDashOffset = 0;
        this.rotateSpeed = 1;
        this.color = "hsla(120, 100%, 50%, 0.1)";
        this.opaqueColor = "hsla(120, 100%, 50%, 1)";
    }

    draw() {
        ctx.setLineDash([5, 5]);
        this.lineDashOffset += this.rotateSpeed;
        ctx.lineDashOffset = this.lineDashOffset;

        ctx.strokeStyle = this.opaqueColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.lineDashOffset = 0;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fill();
    }
}