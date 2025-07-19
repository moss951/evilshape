const ShapeServer = require("./shapeServer");

class CircleServer extends ShapeServer {
    constructor(x, y, r) {
        super(x, y);
        this.r = r;
    }

    particleCollision(particle) {
        if (Math.sqrt( (particle.x - this.x) ** 2 + (particle.y - this.y) ** 2 ) <= this.r) {
            return true;
        }
        return false;
    }
}

module.exports = CircleServer;