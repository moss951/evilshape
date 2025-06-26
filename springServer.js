const toxi = require('toxiclibsjs');

class SpringServer extends toxi.physics2d.VerletSpring2D {
    constructor(particle1, particle2, strength, physics) {
        let length = Math.sqrt( (particle1.x - particle2.x) ** 2 + (particle1.y - particle2.y) ** 2 );
        super(particle1, particle2, length, strength);

        physics.addSpring(this);
    }

    lineCollision(x3, y3, x4, y4) {
        // adapted from https://www.jeffreythompson.org/collision-detection/line-rect.php

        let x1 = this.a.x;
        let x2 = this.b.x;
        let y1 = this.a.y;
        let y2 = this.b.y;

        let uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
        let uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            return true;
        }
        return false;
    }

    rectCollision(rect) {
        // adapted from https://www.jeffreythompson.org/collision-detection/line-rect.php

        let left = this.lineCollision(rect.x, rect.y, rect.x, rect.y + rect.h);
        let right = this.lineCollision(rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h);
        let top = this.lineCollision(rect.x, rect.y, rect.x + rect.w, rect.y);
        let bottom = this.lineCollision(rect.x, rect.y + rect.h, rect.x + rect.w, rect.y + rect.h);

        if (left || right || top || bottom) {
            return true;
        }
        return false;
    }
}

module.exports = SpringServer;