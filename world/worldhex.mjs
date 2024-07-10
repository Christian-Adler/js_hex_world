import {Vector} from "../util/vector.mjs";
import {World} from "./world.mjs";
import {SpotHex} from "./spothex.mjs";

export class WorldHex extends World {
  static maxZ = 7;

  constructor(getZValue) {
    super();
    this.cols = 50;
    this.rows = 50;
    this.grid = new Map();
    this.gridTilesDrawOrder = [];

    for (let r = -WorldHex.maxZ; r < this.rows + WorldHex.maxZ; r++) {
      for (let c = -1; c < this.cols + 1; c++) {
        let spotHex;
        if (typeof getZValue === "function") {
          const zValue = getZValue(c, r);
          if (zValue < 0) continue;
          spotHex = new SpotHex(new Vector(c, r), zValue * WorldHex.maxZ);
        } else
          spotHex = new SpotHex(new Vector(c, r), Math.random() * WorldHex.maxZ);
        this.grid.set(spotHex.getKey(), spotHex);
      }
    }

    // add holes
    if (typeof getZValue !== "function") {
      for (let i = 0; i < this.cols * this.rows / 2.5; i++) {
        const col = Math.floor(Math.random() * this.cols);
        const row = Math.floor(Math.random() * this.rows);
        if (col === this.cols - 1 && row === this.rows - 1 || col === 0 && row === 0)
          continue;
        this.grid.delete(new Vector(col, row).toString());
      }
    }

    // find neighbours
    for (const key of this.grid.keys()) {
      const actSpot = this.grid.get(key);
      const actVec = actSpot.pos;

      for (const y of [-1, 1]) {
        const neighbourVec = new Vector(0, y).addVec(actVec);
        const neighbour = this.grid.get(neighbourVec.toString());
        if (neighbour)
          actSpot.addNeighbour(neighbour);
      }

      for (const x of [-1, 1]) {
        const yValues = actSpot.pos.x % 2 === 0 ? [-1, 0] : [0, 1];
        for (const y of yValues) {
          const neighbourVec = new Vector(x, y).addVec(actVec);
          const neighbour = this.grid.get(neighbourVec.toString());
          if (neighbour)
            actSpot.addNeighbour(neighbour);
        }
      }
    }

    this.calcDrawOrder();
  }

  calcDrawOrder() {
    this.gridTilesDrawOrder = [...this.grid.values()];
    this.gridTilesDrawOrder.sort((a, b) => {
      let compare = a.pos.y - b.pos.y;
      if (compare === 0)
        compare = (a.pos.x % 2) - (b.pos.x % 2);
      if (compare === 0)
        compare = b.z - a.z;
      return compare;
    });
  }

  getSpot(x, y) {
    return this.grid.get(new Vector(x, y).toString());
  }

  getStart() {
    return this.getSpot(0, 0);
  }

  getEnd() {
    return this.getSpot(this.cols - 1, this.rows - 1);
  }

  scale(ctx, worldWidth, worldHeight) {
    ctx.scale(worldWidth / ((this.cols - 1) * SpotHex.xStep + 2 * SpotHex.r), worldHeight / ((this.rows + 0.5) * SpotHex.height + WorldHex.maxZ));
    ctx.translate(SpotHex.r, SpotHex.r * Math.sin(SpotHex.a) + WorldHex.maxZ);
  }

  draw(ctx) {
    for (const spot of this.gridTilesDrawOrder) {
      spot.draw(ctx);
    }
  }
}