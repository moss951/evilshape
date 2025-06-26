class SpringClient {
    constructor(particle1, particle2) {
        this.particle1 = particle1;
        this.particle2 = particle2;
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.particle1.x, this.particle1.y);
        ctx.lineTo(this.particle2.x, this.particle2.y);
        ctx.stroke();
    }
}