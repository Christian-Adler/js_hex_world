export class Spot {
  constructor(pos) {
    this.pos = pos;
    this.neighbours = [];
    // for A* path finding
    this.prevSpot = null;
    this.f = 0;
    this.g = Number.MAX_SAFE_INTEGER;
    this.h = 0;
  }

  addNeighbour(neighbour) {
    this.neighbours.push(neighbour);
  }

  getNeighbours() {
    return [...this.neighbours];
  }

  distanceToSpot(other) {
    return this.pos.distance(other.pos);
  }

  calcPos() {
    return this.pos.clone().add(0.5);
  }

  draw(ctx, optColor = "white") {
    // ctx.lineWidth = 0.1;
    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, 0.4, 0, Math.PI * 2);
    if (optColor) {
      ctx.fillStyle = optColor;
      ctx.fill();
    }
    // ctx.stroke();
  }
}
