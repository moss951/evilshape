class PlayerServer {
    constructor(username, ready, color) {
        this.username = username;
        this.particleIndex = null;
        this.cursorParticleIndex = null;
        this.ready = ready;
        this.color = color;
    }
}

module.exports = PlayerServer;