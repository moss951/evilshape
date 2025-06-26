const toxi = require('toxiclibsjs');
const ParticleServer = require('./particleServer');

class CursorParticleServer extends ParticleServer {
    constructor(x, y, attractionRadius, attractionStrength, playerParticle, physics) {
        super(x, y, physics);
        this.r = 8;
        this.attractionRadius = attractionRadius;
        physics.addParticle(this);
        playerParticle.addBehavior(new toxi.physics2d.behaviors.AttractionBehavior(this, attractionRadius, attractionStrength));
        this.lock();
    }
}

module.exports = CursorParticleServer;