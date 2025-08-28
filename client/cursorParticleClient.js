class CursorParticleClient extends ParticleClient {
    constructor(x, y, attractionRadius) {
        super(x, y);
        this.r = 8;
        this.attractionRadius = attractionRadius;
        this.lineDashOffset = 0;
        this.rotateSpeed = -0.5;
    }

    draw(username, currentBoostTime) {
        // attraction radius
        ctx.setLineDash([5, 5]);
        this.lineDashOffset += currentBoostTime == 0 ? this.rotateSpeed : this.rotateSpeed * 7;
        ctx.lineDashOffset = this.lineDashOffset;

        ctx.strokeStyle = currentBoostTime == 0 ? "gray" : "red";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.attractionRadius, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.lineDashOffset = 0;

        // username
        ctx.font ="24px DS-BIOS";

        if (this.usernameOffset == undefined) {
            this.usernameOffset = ctx.measureText(username).width / 2;
        }

        ctx.fillText(username, this.x - this.usernameOffset, this.y);
    }
}