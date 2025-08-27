const CircleServer = require("./circleServer");

class FlagServer extends CircleServer {
    constructor(x, y) {
        super(x, y, 25);
        this.type = "flag";
    }
}

module.exports = FlagServer;