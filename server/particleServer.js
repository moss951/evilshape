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

    rectCollision(rect) {
        if (this.x >= rect.x && this.x <= rect.x + rect.w && this.y >= rect.y && this.y <= rect.y + rect.h) {
            return true;
        }
        return false;
    }

    handleCollision(rect) {
        if (this.rectCollision(rect)) this.x = this.previousX;
        if (this.rectCollision(rect)) this.y = this.previousY;
    }
}

module.exports = ParticleServer;