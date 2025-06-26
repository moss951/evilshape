class PlayerServer {
    constructor(username, particleIndex, ready) {
        this.username = username;
        this.particleIndex = particleIndex;
        this.ready = ready;
    }
}

module.exports = PlayerServer;