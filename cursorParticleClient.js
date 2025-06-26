class CursorParticleClient extends ParticleClient {
    constructor(x, y, attractionRadius) {
        super(x, y);
        this.r = 8;
        this.attractionRadius = attractionRadius;
    }

    draw(username) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.attractionRadius, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.font ="16px sans-serif";

        if (this.usernameOffset == undefined) {
            this.usernameOffset = ctx.measureText(username).width / 2;
        }

        ctx.fillText(username, this.x - this.usernameOffset, this.y);
    }
}