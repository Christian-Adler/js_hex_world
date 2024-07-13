import {Spot} from "./spot.mjs";
import {Vector} from "../util/vector.mjs";
import {WorldHex} from "./worldhex.mjs";

export class SpotHex extends Spot {
  static a = 2 * Math.PI / 6;
  static r = 1;
  static height = 2 * SpotHex.r * Math.sin(SpotHex.a);
  static xStep = SpotHex.r + SpotHex.r * Math.cos(SpotHex.a);

  static calcHexAdjustedPos(pos) {
    const xAdjusted = pos.x * SpotHex.xStep;
    const yAdjusted = pos.y * SpotHex.height + (pos.x % 2 === 0 ? 0 : SpotHex.height / 2);
    return new Vector(xAdjusted, yAdjusted);
  }

  constructor(pos, z) {
    super(pos, z, WorldHex.maxZ);
    // hexPos is the hex "grid" adjusted pos without z!
    this.hexPos = this.calcHexPos();
    // pixel pos has to be calculated by transform
    // pixel pos is the hexPos with z and transform
    this.pixelPos = new Vector(0, 0);
  }

  /**
   * 2D distance hexPos (no z)
   * @param other
   * @returns {number}
   */
  distanceToSpot(other) {
    return this.hexPos.distance(other.hexPos);
  }

  calcHexPos() {
    return SpotHex.calcHexAdjustedPos(this.pos);
  }

  draw(ctx, hsl) {
    const vec = this.hexPos;
    const color = hsl || this.worldColor;
    // draw walls
    if (this.z > 0) {

      ctx.fillStyle = color.clone().addLightness(-10).toColor();

      ctx.beginPath();
      ctx.moveTo(vec.x + SpotHex.r, vec.y - this.z);
      ctx.lineTo(vec.x + SpotHex.r, vec.y);
      ctx.lineTo(vec.x + SpotHex.r * Math.cos(SpotHex.a), vec.y + SpotHex.r * Math.sin(SpotHex.a));
      ctx.lineTo(vec.x, vec.y - this.z);
      ctx.fill();

      ctx.fillStyle = color.clone().addLightness(-5).toColor();
      ctx.beginPath();
      ctx.moveTo(vec.x, vec.y - this.z);
      ctx.lineTo(vec.x + SpotHex.r * Math.cos(SpotHex.a * 2), vec.y + SpotHex.r * Math.sin(SpotHex.a * 2));
      ctx.lineTo(vec.x + SpotHex.r * Math.cos(SpotHex.a * 3), vec.y + SpotHex.r * Math.sin(SpotHex.a * 3));
      ctx.lineTo(vec.x + SpotHex.r * Math.cos(SpotHex.a * 3), vec.y + SpotHex.r * Math.sin(SpotHex.a * 3) - this.z);
      ctx.fill();

      ctx.fillStyle = color.clone().addLightness(-2).toColor();
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

    ctx.fillStyle = color.toColor();
    ctx.fill();
  }

  drawHighlight(ctx) {
    ctx.beginPath();
    // ctx.rect(pos.x, pos.y, 1, 1);
    ctx.lineWidth = 0.2;
    let aFactor = 0;
    let r = SpotHex.r * 1.5;
    for (let i = 0; i < 6; i++) {
      ctx.lineTo(this.hexPos.x + r * Math.cos(SpotHex.a * i), this.hexPos.y + r * Math.sin(SpotHex.a * i) - this.z);
      aFactor += (i % 2 === 0) ? 1 : 3;
    }
    ctx.closePath();

    // ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    // ctx.fill();
    ctx.stroke();
  }
}
