import {Vector} from "./vector.mjs";

export class AStar {
  constructor(start, end) {
    this.openSet = [];
    this.closedSet = [];
    this.start = start;
    this.end = end;

    this.start.g = 0;
    this.openSet.push(start);

    this.shortestPathToAct = null;
    this.shortestPathToEnd = null;
  }

  heuristicCostEstimate(spot) {
    // return spot.manhattenDistanceToSpot(this.end);
    return spot.distanceToSpot(this.end);
  }

  constructPath(spot) {
    const path = [];
    let current = spot;
    while (current) {
      path.push(current);
      current = current.prevSpot;
    }
    path.reverse();
    return path;
  }

  next() {
    if (this.shortestPathToEnd)
      return true; // already calculated

    if (this.openSet.length > 0) {
      let minFIdx = 0;
      let minFSpot = this.openSet[0];
      for (let i = 1; i < this.openSet.length; i++) {
        const spot = this.openSet[i];
        if (spot.f < minFSpot.f) {
          minFSpot = spot;
          minFIdx = i;
        }
      }

      if (minFSpot === this.end) {
        console.log('Found path to end');
        this.shortestPathToEnd = this.constructPath(minFSpot);
        this.shortestPathToAct = null;
        return true;
      }
      this.shortestPathToAct = this.constructPath(minFSpot);

      this.openSet.splice(minFIdx, 1);
      this.closedSet.push(minFSpot);

      const neighbours = minFSpot.getNeighbours();
      for (const neighbour of neighbours) {
        if (this.closedSet.includes(neighbour))
          continue; // already done

        const tentativeGScore = minFSpot.g + minFSpot.distanceToSpot(neighbour) + 2 * Math.abs(minFSpot.z - neighbour.z);
        if (tentativeGScore >= neighbour.g && this.openSet.includes(neighbour))
          continue; // not a better path

        this.openSet.push(neighbour);

        neighbour.g = tentativeGScore;
        neighbour.h = this.heuristicCostEstimate(neighbour);
        neighbour.f = neighbour.g + neighbour.h;
        neighbour.prevSpot = minFSpot;
      }

      return false;
    }

    return true;
  }

  drawPath(ctx, path, color) {
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

  drawPathQuadratic(ctx, path, color, offset = 0) {
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
    if (this.shortestPathToAct)
      this.drawPath(ctx, this.shortestPathToAct, 'grey');

    if (this.shortestPathToEnd) {
      this.drawPathQuadratic(ctx, this.shortestPathToEnd, 'rgba(0,0,0,0.15)', 0);
      this.drawPathQuadratic(ctx, this.shortestPathToEnd, 'purple', 1);
    }
  }

}