import {Vector} from "./vector.mjs";
import {showAStarPathInfo} from "../ui/controls.mjs";

export class AStar {
  constructor() {
    this._openSet = [];
    this._closedSet = [];

    this._shortestPathToAct = null;
    this._shortestPathToEnd = null;

    this._gScoreZFactor = 2;

    this._start = null;
    this._end = null;
  }

  set start(value) {
    this._start = value;
    this.calcPath();
  }

  set end(value) {
    this._end = value;
    this.calcPath();
  }

  set gScoreZFactor(value) {
    this._gScoreZFactor = Math.max(0, value);
    this.calcPath();
  }

  calcPath() {
    if (!this._start || !this._end) return;

    this._shortestPathToAct = null;
    this._shortestPathToEnd = null;

    this._openSet = [];
    this._closedSet = [];

    this._start.g = 0;
    this._openSet.push(this._start);

    let finished = false;
    do {
      finished = this.next();
    } while (!finished);
  }


  next() {
    if (this._shortestPathToEnd)
      return true; // already calculated

    if (this._openSet.length > 0) {
      let minFIdx = 0;
      let minFSpot = this._openSet[0];
      for (let i = 1; i < this._openSet.length; i++) {
        const spot = this._openSet[i];
        if (spot.f < minFSpot.f) {
          minFSpot = spot;
          minFIdx = i;
        }
      }

      if (minFSpot === this._end) {
        // console.log('Found path to end');
        this._shortestPathToEnd = this._constructPath(minFSpot);
        this._shortestPathToAct = null;
        this.showPathInfo();
        return true;
      }
      this._shortestPathToAct = this._constructPath(minFSpot);

      this._openSet.splice(minFIdx, 1);
      this._closedSet.push(minFSpot);

      const neighbours = minFSpot.getNeighbours(); // allow to determine neighbours on the fly??
      for (const neighbour of neighbours) {
        if (this._closedSet.includes(neighbour))
          continue; // already done

        const tentativeGScore = minFSpot.g + minFSpot.distanceToSpot(neighbour) + this._gScoreZFactor * Math.abs(minFSpot.z - neighbour.z);
        if (tentativeGScore >= neighbour.g && this._openSet.includes(neighbour))
          continue; // not a better path

        this._openSet.push(neighbour);

        neighbour.g = tentativeGScore;
        neighbour.h = this._heuristicCostEstimate(neighbour);
        neighbour.f = neighbour.g + neighbour.h;
        neighbour.prevSpot = minFSpot;
      }

      return false;
    }

    return true;
  }

  showPathInfo() {
    let zDiff = 0;
    let prevZVal = 0;
    for (const spot of this._shortestPathToEnd) {
      const z = spot.z;
      zDiff += Math.abs(z - prevZVal);
      prevZVal = z;
    }
    showAStarPathInfo(`Path len: ${this._shortestPathToEnd.length}, Height distance: ${zDiff.toFixed(2)}`);
  }

  _heuristicCostEstimate(spot) {
    return spot.distanceToSpot(this._end);
  }

  _constructPath(spot) {
    const path = [];
    let current = spot;
    while (current) {
      path.push(current);
      current = current.prevSpot;
    }
    path.reverse();
    return path;
  }

  _drawPath(ctx, path, color) {
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.beginPath();
    let firstSpot = true;
    for (const spot of path) {
      const actPathVec = spot.calcPos();
      if (firstSpot) {
        firstSpot = false;
        ctx.moveTo(actPathVec.x, actPathVec.y - spot.z);
      } else
        ctx.lineTo(actPathVec.x, actPathVec.y - spot.z);
      // spot.draw(ctx,color);
    }
    ctx.stroke();
  }

  _drawPathQuadratic(ctx, path, color, offset = 0) {
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.beginPath();

    let vecPrevMid = null;
    let vecPrev = null;
    for (let i = 0; i < path.length; i++) {
      const spot = path[i];
      const actPathVec = spot.calcPos();

      const yAdjustedVec = new Vector(actPathVec.x, actPathVec.y - spot.z - offset);

      if (i === 0) {
        ctx.moveTo(yAdjustedVec.x, yAdjustedVec.y);
      } else {
        // quadratic line from between two tiles as endpoints and tile as control point
        const midVec = vecPrev.clone().addVec(yAdjustedVec.clone().subVec(vecPrev).mult(0.5));
        ctx.quadraticCurveTo(vecPrev.x, vecPrev.y, midVec.x, midVec.y);
        if (i === path.length - 1) // last half of last tile
          ctx.lineTo(yAdjustedVec.x, yAdjustedVec.y);
        vecPrevMid = midVec;
      }
      vecPrev = yAdjustedVec;
    }
    ctx.stroke();
  }

  draw(ctx) {
    // for (const spot of this.closedSet) {
    //   spot.draw(ctx, 'rgb(6,0,99)');
    // }
    // for (const spot of this.openSet) {
    //   spot.draw(ctx, 'rgb(18,88,186)');
    // }
    ctx.lineWidth = 0.4;
    if (this._shortestPathToAct)
      this._drawPath(ctx, this._shortestPathToAct, 'grey');

    if (this._shortestPathToEnd) {
      this._drawPathQuadratic(ctx, this._shortestPathToEnd, 'rgba(0,0,0,0.15)', 0);
      this._drawPathQuadratic(ctx, this._shortestPathToEnd, 'purple', 1);
    }
  }

}