class LevelClient {
    constructor() {
        this.walls = [];
        this.flag = undefined;
    }

    draw(offset) {
        for (let i = 0; i < this.walls.length; i++) {
            this.walls[i].draw(offset);
        }

        this.flag.draw(offset);
    }
}