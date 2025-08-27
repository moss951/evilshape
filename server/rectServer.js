const ShapeServer = require('./shapeServer');

class RectServer extends ShapeServer {
    constructor(x, y, w, h) {
        super(x, y, "rect");
        this.w = w;
        this.h = h;
    }

    particleCollision(particle) {
        if (particle.x >= this.x && particle.x <= this.x + this.w && particle.y >= this.y && particle.y <= this.y + this.h) {
            return true;
        }

        return false;
    }
}

module.exports = RectServer;