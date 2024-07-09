import {Spot} from "./spot.mjs";
import {Vector} from "../util/vector.mjs";

export class SpotHex extends Spot {
  static a = 2 * Math.PI / 6;
  static r = 1;
  static height = 2 * SpotHex.r * Math.sin(SpotHex.a);
  static xStep = SpotHex.r + SpotHex.r * Math.cos(SpotHex.a);

  constructor(pos) {
    super(pos);
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

  draw(ctx, optColor = "white") {
    const vec = this.calcPos();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      ctx.lineTo(vec.x + SpotHex.r * Math.cos(SpotHex.a * i), vec.y + SpotHex.r * Math.sin(SpotHex.a * i));
    }
    ctx.closePath();

    if (optColor) {
      ctx.fillStyle = optColor;
      ctx.fill();
    } else {
      // ctx.lineWidth = 0.1;
      ctx.stroke();
    }
  }
}
