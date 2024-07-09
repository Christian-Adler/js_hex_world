export class HSL {
  /**
   *
   * @param h 0-360 (default: 0)
   * @param s 0-100 (default: 100)
   * @param l 0-100 (default: 50)
   * @param a 0-1 (default: 1)
   */
  constructor(h = 0, s = 100, l = 50, a = 1) {
    this.h = h;
    this.s = s;
    this.l = l;
    this.a = a;
  }

  toColor() {
    return `hsl(${this.h},${this.s}%,${this.l}%,${this.a})`;
  }

  setHue(hue) {
    this.h = (hue + 360) % 360;
    return this;
  }

  addHue(hue) {
    this.h = (this.h + hue + 360) % 360;
    return this;
  }

  setSaturation(s) {
    this.s = s;
    return this;
  }

  addSaturation(s) {
    this.s = Math.max(100, Math.min(0, this.s + s));
    return this;
  }

  setLightness(l) {
    this.l = l;
    return this;
  }

  addLightness(l) {
    this.l = Math.min(100, Math.max(0, this.l + l));
    return this;
  }

  clone() {
    return new HSL(this.h, this.s, this.l, this.a);
  }
}