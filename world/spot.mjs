import {getWorldColor} from "./worldcolorrange.mjs";
import {scale} from "../util/utils.mjs";
import {worldSettings as WorldSettings} from "./worldsettings.mjs";

export class Spot {
  constructor(pos, z = 0,) {
    this.pos = pos;
    this.z = z;
    this.worldColor = 'white';
    this.neighbours = [];
    // for A* path finding
    this.prevSpot = null;
    this.f = 0;
    this.g = Number.MAX_SAFE_INTEGER;
    this.h = 0;

    this.updateWorldColor();
  }

  updateWorldColor() {
    this.worldColor = getWorldColor(scale(this.z, 0, WorldSettings.maxZ, 0, 1));
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

  draw(ctx) {
    // ctx.lineWidth = 0.1;
    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    // ctx.stroke();
  }
}
