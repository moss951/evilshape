const toxi = require('toxiclibsjs');

class SpringServer extends toxi.physics2d.VerletSpring2D {
    constructor(particle1, particle2, strength, physics) {
        let length = Math.sqrt( (particle1.x - particle2.x) ** 2 + (particle1.y - particle2.y) ** 2 );
        super(particle1, particle2, length, strength);

        physics.addSpring(this);
    }
}

module.exports = SpringServer;