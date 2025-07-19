class Button {
    constructor(x, y, w, h, text) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
        this.clicked = false;
    }

    draw() {
        if (this.clicked) {
            ctx.fillStyle = "lightgray";
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.w, this.h);
            ctx.fill();
        }

        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.w, this.h);
        ctx.stroke();

        ctx.fillStyle = "black";
        ctx.font = "48px DS-BIOS";
        ctx.fillText(this.text, this.x + this.w / 2 - ctx.measureText(this.text).width / 2, this.y + 38);
    }

    isClicked(x, y) {
        if (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h) {
            this.clicked = true;
            return true;
        }
        return false;
    }
}