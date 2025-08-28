class ParticleClient {
    constructor(x, y, isPlayer, color) {
        this.x = x;
        this.y = y;
        this.r = 8;
        this.previousX = x;
        this.previousY = y;
        this.isPlayer = isPlayer;
        this.lineDashOffset = 0;
        this.rotateSpeed = -0.5;
        this.color = color;
        this.opaqueColor = this.color.replace(/,\s*([\d.]+)%/, ",75%").replace(/([\d.]+)\)$/, "1)");
    }

    draw(username = "") {
        ctx.setLineDash([2, 2]);
        this.lineDashOffset += this.rotateSpeed;
        ctx.lineDashOffset = this.lineDashOffset;

        ctx.strokeStyle = this.opaqueColor;
        ctx.lineWidth = 2;

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