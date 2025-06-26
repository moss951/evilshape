class ParticleClient {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 8;
        this.previousX = x;
        this.previousY = y;
    }

    draw(username) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.font ="16px sans-serif";

        if (this.usernameOffset == undefined) {
            this.usernameOffset = ctx.measureText(username).width / 2;
        }

        ctx.fillText(username, this.x - this.usernameOffset, this.y - 30);
    }
}