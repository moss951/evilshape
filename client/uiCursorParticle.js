class UICursorParticle extends CursorParticleClient {
    constructor(x, y, attractionRadius, attractionStrength, physics) {
        super(x, y, attractionRadius, "hsl(0, 100%, 50%, 0.1)");
        this.pressed = false;
        this.particle = new toxi.physics2d.VerletParticle2D(x, y);
        physics.addParticle(this.particle);
        physics.addBehavior(new toxi.physics2d.behaviors.AttractionBehavior(this.particle, attractionRadius, attractionStrength));
        this.particle.lock();
    }

    draw() {
        super.draw("", this.pressed ? 1 : 0);
        this.particle.x = this.x;
        this.particle.y = this.y;
    }
}