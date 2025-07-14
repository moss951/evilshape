const toxi = require('toxiclibsjs');

class ParticleServer extends toxi.physics2d.VerletParticle2D {
    constructor(x, y, physics, isPlayer) {
        super(x, y);
        this.r = 8;
        this.previousX = x;
        this.previousY = y;
        this.currentBoostTime = 0;
        this.isPlayer = isPlayer;

        physics.addParticle(this);
    }

    handleCollision(rect) {
        if (rect.particleCollision(this)) this.x = this.previousX;
        if (rect.particleCollision(this)) this.y = this.previousY;
    }
}

module.exports = ParticleServer;