class CursorParticleClient {
    constructor(x, y, attractionRadius, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.opaqueColor = this.color.replace(/,\s*([\d.]+)%/, ",75%").replace(/([\d.]+)\)$/, "1)");
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

        ctx.strokeStyle = currentBoostTime == 0 ? "gray" : this.opaqueColor;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.attractionRadius, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.lineDashOffset = 0;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.attractionRadius, 0, 2 * Math.PI);
        ctx.fill();

        // username
        ctx.fillStyle = this.opaqueColor;
        ctx.font ="24px DS-BIOS";

        if (this.usernameOffset == undefined) {
            this.usernameOffset = ctx.measureText(username).width / 2;
        }

        ctx.fillText(username, this.x - this.usernameOffset, this.y);
    }
}