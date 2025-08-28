const toxi = require('toxiclibsjs');

class ParticleServer extends toxi.physics2d.VerletParticle2D {
    constructor(x, y, physics, isPlayer, color) {
        super(x, y);
        this.r = 8;
        this.previousX = x;
        this.previousY = y;
        this.currentBoostTime = 0;
        this.isPlayer = isPlayer;
        this.color = color;

        physics.addParticle(this);
    }

    handleCollision(shape) {
        if (shape.particleCollision(this)) this.x = this.previousX;
        if (shape.particleCollision(this)) this.y = this.previousY;
    }
}

module.exports = ParticleServer;