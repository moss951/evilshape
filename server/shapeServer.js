class ShapeServer {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
    }

    particleCollision() {
        return false;
    }
}

module.exports = ShapeServer;