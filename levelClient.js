class LevelClient {
    constructor(walls) {
        this.walls = walls;
    }

    draw(offset) {
        for (let i = 0; i < this.walls.length; i++) {
            this.walls[i].draw(offset);
        }
    }
}