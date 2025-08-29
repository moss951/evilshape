class Button {
    constructor(x, y, w, h, text, physics) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
        this.clicked = false;
        this.particles = [];
        this.visualParticles = [];
        this.springs = [];
        this.visualSprings = [];
        this.springStrength = 0.5;
        this.springLength = 50;

        // add particles
        for (let i = this.y; i <= this.y + this.h; i += this.springLength) {
            for (let j = this.x; j <= this.x + this.w; j += this.springLength) {
                this.visualParticles.push(new ParticleClient(j, i, false, "hsl(0,0%,0%,0.1)"));
                this.particles.push(new toxi.physics2d.VerletParticle2D(j, i));
            }
        }

        for (let i = 0; i < this.particles.length; i++) {
            physics.addParticle(this.particles[i]);
        }

        // lock corners
        this.particles[0].lock();
        this.particles[this.particles.length - 1].lock();
        this.particles[this.particles.length / 2].lock();
        this.particles[this.particles.length / 2 - 1].lock();

        // add springs
        for (let i = 0; i < this.visualParticles.length - 1; i++) {
            if (i + 1 == this.visualParticles.length / 2) {
                this.visualSprings.push(new SpringClient(this.visualParticles[i], this.visualParticles[this.visualParticles.length - 1]));
                this.springs.push(new toxi.physics2d.VerletConstrainedSpring2D(this.particles[i], this.particles[this.particles.length - 1], this.springLength, this.springStrength));
            }
            else {
                this.visualSprings.push(new SpringClient(this.visualParticles[i], this.visualParticles[i + 1]));
                this.springs.push(new toxi.physics2d.VerletConstrainedSpring2D(this.particles[i], this.particles[i + 1], this.springLength, this.springStrength));
            }
        }
        this.visualSprings.push(new SpringClient(this.visualParticles[0], this.visualParticles[this.visualParticles.length / 2]));
        this.springs.push(new toxi.physics2d.VerletConstrainedSpring2D(this.particles[0], this.particles[this.particles.length / 2], this.springLength, this.springStrength));

        for (let i = 0; i < this.springs.length; i++) {
            physics.addSpring(this.springs[i]);
        }
    }

    draw() {
        for (let i = 0; i < this.particles.length; i++) {
            this.visualParticles[i].x = this.particles[i].x;
            this.visualParticles[i].y = this.particles[i].y;
        }

        if (this.clicked) {
            ctx.fillStyle = "lightgray";
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.w, this.h);
            ctx.fill();
        }

        // ctx.lineWidth = 2;
        // ctx.strokeStyle = "black";
        // ctx.beginPath();
        // ctx.rect(this.x, this.y, this.w, this.h);
        // ctx.stroke();

        ctx.fillStyle = "black";
        ctx.font = "48px DS-BIOS";
        ctx.fillText(this.text, this.x + this.w / 2 - ctx.measureText(this.text).width / 2, this.y + 38);

        for (let i = 0; i < this.visualParticles.length; i++) {
            this.visualParticles[i].draw();
        }

        for (let i = 0; i < this.visualSprings.length; i++) {
            this.visualSprings[i].draw();
        }
    }

    isClicked(x, y) {
        if (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h) {
            this.clicked = true;
            return true;
        }
        return false;
    }
}