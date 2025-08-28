class ParticleClient {
    constructor(x, y, isPlayer) {
        this.x = x;
        this.y = y;
        this.r = 8;
        this.previousX = x;
        this.previousY = y;
        this.isPlayer = isPlayer;
        this.lineDashOffset = 0;
        this.rotateSpeed = -0.5;
    }

    draw(username = "") {
        ctx.setLineDash([2, 2]);
        this.lineDashOffset += this.rotateSpeed;
        ctx.lineDashOffset = this.lineDashOffset;

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.lineDashOffset = 0;

        ctx.fillStyle = "black";

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r / 2, 0, 2 * Math.PI);
        ctx.fill();

        if (!this.isPlayer) return;

        ctx.fillStyle = "black";
        ctx.font ="24px DS-BIOS";

        if (this.usernameOffset == undefined) {
            this.usernameOffset = ctx.measureText(username).width / 2;
        }

        ctx.fillText(username, this.x - this.usernameOffset, this.y - 30);
    }
}