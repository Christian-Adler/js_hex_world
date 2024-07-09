import {Spot} from "./spot.mjs";
import {Vector} from "../util/vector.mjs";
import {WorldHex} from "./worldhex.mjs";

export class SpotHex extends Spot {
  static a = 2 * Math.PI / 6;
  static r = 1;
  static height = 2 * SpotHex.r * Math.sin(SpotHex.a);
  static xStep = SpotHex.r + SpotHex.r * Math.cos(SpotHex.a);

  constructor(pos, z) {
    super(pos, z, WorldHex.maxZ);
  }

  getKey() {
    return this.pos.toString();
  }

  distanceToSpot(other) {
    return this.calcPos().distance(other.calcPos());
  }

  calcPos() {
    const x = this.pos.x * SpotHex.xStep;
    const y = this.pos.y * SpotHex.height + (this.pos.x % 2 === 0 ? 0 : SpotHex.height / 2);
    return new Vector(x, y);
  }

  draw(ctx, hsl) {
    const vec = this.calcPos();

    // draw walls
    if (this.z > 0) {

      ctx.fillStyle = this.worldColor.clone().addLightness(-10).toColor();

      ctx.beginPath();
      ctx.moveTo(vec.x + SpotHex.r, vec.y - this.z);
      ctx.lineTo(vec.x + SpotHex.r, vec.y);
      ctx.lineTo(vec.x + SpotHex.r * Math.cos(SpotHex.a), vec.y + SpotHex.r * Math.sin(SpotHex.a));
      ctx.lineTo(vec.x, vec.y - this.z);
      ctx.fill();

      ctx.fillStyle = this.worldColor.clone().addLightness(-5).toColor();
      ctx.beginPath();
      ctx.moveTo(vec.x, vec.y - this.z);
      ctx.lineTo(vec.x + SpotHex.r * Math.cos(SpotHex.a * 2), vec.y + SpotHex.r * Math.sin(SpotHex.a * 2));
      ctx.lineTo(vec.x + SpotHex.r * Math.cos(SpotHex.a * 3), vec.y + SpotHex.r * Math.sin(SpotHex.a * 3));
      ctx.lineTo(vec.x + SpotHex.r * Math.cos(SpotHex.a * 3), vec.y + SpotHex.r * Math.sin(SpotHex.a * 3) - this.z);
      ctx.fill();

      ctx.fillStyle = this.worldColor.clone().addLightness(-2).toColor();
      ctx.beginPath();
      ctx.moveTo(vec.x + SpotHex.r * Math.cos(SpotHex.a), vec.y - this.z);
      ctx.lineTo(vec.x + SpotHex.r * Math.cos(SpotHex.a), vec.y + SpotHex.r * Math.sin(SpotHex.a));
      ctx.lineTo(vec.x + SpotHex.r * Math.cos(SpotHex.a * 2), vec.y + SpotHex.r * Math.sin(SpotHex.a * 2));
      ctx.lineTo(vec.x + SpotHex.r * Math.cos(SpotHex.a * 2), vec.y - this.z);
      ctx.fill();
    }

    // draw floor
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      ctx.lineTo(vec.x + SpotHex.r * Math.cos(SpotHex.a * i), vec.y + SpotHex.r * Math.sin(SpotHex.a * i) - this.z);
    }
    ctx.closePath();

    ctx.fillStyle = this.worldColor.toColor();
    ctx.fill();


  }
}
