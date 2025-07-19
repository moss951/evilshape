const RectServer = require('./rectServer');

class FloorServer extends RectServer {
    constructor(x, y, w) {
        super(x, y, w, 0);
    }

    particleCollision(particle) {
        if (particle.x >= this.x && particle.x <= this.x + this.w && particle.y >= this.y && particle.previousY <= this.y) {
            return true;
        }
        return false;
    }
}

module.exports = FloorServer;