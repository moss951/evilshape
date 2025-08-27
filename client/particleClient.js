class ParticleClient {
    constructor(x, y, isPlayer) {
        this.x = x;
        this.y = y;
        this.r = 8;
        this.previousX = x;
        this.previousY = y;
        this.isPlayer = isPlayer;
    }

    draw(username = "") {
        ctx.setLineDash([0, 0]);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.stroke();

        if (!this.isPlayer) return;

        ctx.fillStyle = "black";
        ctx.font ="24px DS-BIOS";

        if (this.usernameOffset == undefined) {
            this.usernameOffset = ctx.measureText(username).width / 2;
        }

        ctx.fillText(username, this.x - this.usernameOffset, this.y - 30);
    }
}