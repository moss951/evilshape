class PlayerServer {
    constructor(username, ready) {
        this.username = username;
        this.particleIndex = null;
        this.cursorParticleIndex = null;
        this.ready = ready;
    }
}

module.exports = PlayerServer;