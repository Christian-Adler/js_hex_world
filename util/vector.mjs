class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return `(${this.x},${this.y})`;
  }

  isZero() {
    return this.x === 0 && this.y === 0;
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  mult(val) {
    this.x *= val;
    this.y *= val;
    return this;
  }

  add(xVal, yVal) {
    this.x += xVal;
    this.y += (typeof yVal === 'number') ? yVal : xVal;
    return this;
  }

  sub(xVal, yVal) {
    this.x -= xVal;
    this.y -= (typeof yVal === 'number') ? yVal : xVal;
    return this;
  }

  addVec(vec) {
    return this.add(vec.x, vec.y);
  }

  subVec(vec) {
    return this.sub(vec.x, vec.y);
  }

  setVec(vec) {
    return this.set(vec.x, vec.y);
  }

  dotProduct(vec) {
    return this.x * vec.x + this.y * vec.y;
  }

  distance(other) {
    return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
  }

  manhattenDistance(other) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }

  normalize() {
    const norm = Vector.fromAngle(this.toRadians());
    this.x = norm.x;
    this.y = norm.y;
    return this;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  len() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  setLength(val) {
    return this.normalize().mult(val);
  }

  limit(val) {
    if (val <= 0)
      return this.mult(0);
    if (this.len() > val)
      return this.normalize().mult(val);
    return this;
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  toRadians() {
    if (this.x === 0) {
      if (this.y >= 0)
        return Math.PI / 2;
      else
        return Math.PI * 3 / 2;
    }
    if (this.x > 0) {
      if (this.y >= 0)
        return Math.atan(this.y / this.x);
      else
        return 2 * Math.PI - Math.atan(-this.y / this.x);
    } else {
      if (this.y >= 0)
        return Math.PI - Math.atan(this.y / -this.x);
      else
        return Math.PI + Math.atan(-this.y / -this.x);
    }
  }

  static fromAngle(radians) {
    if (radians < 0) radians += Math.PI * 2;
    const x = Math.cos(radians);
    const y = Math.sin(radians);
    return new Vector(x, y);
  }

  static fromPoint(point) {
    return new Vector(point.x, point.y);
  }

  static scalarProjection(vecP, vecA, vecB) {
    const ap = vecP.clone().subVec(vecA);
    const ab = vecB.clone().subVec(vecA);
    ab.normalize();
    ab.mult(ap.dotProduct(ab));
    // noinspection UnnecessaryLocalVariableJS
    const normalPoint = vecA.clone().addVec(ab);
    return normalPoint;
  }

  static zero() {
    return new Vector(0, 0);
  }
}

export {Vector};