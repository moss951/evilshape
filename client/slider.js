class Slider {
    constructor(minVal, maxVal, defaultVal, x, y, w) {
        this.defaultVal = defaultVal;
        this.currentVal = defaultVal;
        this.minVal = minVal;
        this.maxVal = maxVal;
        this.circleX = defaultVal / maxVal * w + x;
        this.x = x;
        this.y = y;
        this.w = w;
        this.r = 10;
        this.clicked = false;
        this.lineDashOffset = 0;
        this.rotateSpeed = -1;
    }

    isClicked(mouseX, mouseY) {
        let dx = mouseX - this.circleX;
        let dy = mouseY - this.y;

        if (Math.sqrt(dx**2 + dy**2) <= this.r || Math.abs(dy) <= this.r && mouseX > this.x && mouseX < this.x + this.w) {
            this.clicked = true;
            return true;
        }

        return false;
    }

    updateVal(mouseX) {
        if (mouseX < this.x) {
            this.currentVal = this.minVal;
            this.circleX = this.x;
            return;
        }

        if (mouseX > this.x + this.w) {
            this.currentVal = this.maxVal;
            this.circleX = this.x + this.w;
            return;
        }

        let relativeX = mouseX - this.x;
        this.currentVal = relativeX / this.w * this.maxVal;
        this.circleX = mouseX;
    }
    
    draw() {
        ctx.fillStyle = "hsla(" + this.currentVal + ", 100%, 50%, 0.25)";
        ctx.beginPath();
        ctx.rect(this.x - this.r, this.y - this.r, this.w + this.r * 2, this.r * 2);
        ctx.fill();

        ctx.fillStyle = "hsla(" + this.currentVal + ", 100%, 50%, 0.5)";
        ctx.beginPath();
        ctx.arc(this.circleX, this.y, 10, 0, 2 * Math.PI);
        ctx.fill();

        ctx.setLineDash([4, 4]);
        this.lineDashOffset += this.rotateSpeed;
        ctx.lineDashOffset = this.lineDashOffset;

        ctx.strokeStyle = "gray";
        ctx.arc(this.circleX, this.y, 10, 0, 2 * Math.PI);
        ctx.stroke();
    }
}