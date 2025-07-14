class RectServer {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
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