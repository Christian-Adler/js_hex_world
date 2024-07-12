import {Vector} from "../util/vector.mjs";
import {World} from "./world.mjs";
import {SpotHex} from "./spothex.mjs";
import {getNoiseValAt} from "./heightmap.mjs";
import {actMousePos} from "../ui/mouse.mjs";

export class WorldHex extends World {
  static maxZ = 7;
  static widthTilesFactor = 50 / 1500;
  static heightTilesFactor = 50 / 1200;

  static calcAdjustedPos(x, y) {
    const pos = SpotHex.calcSpotPos(x, y)
    const zValue = getNoiseValAt(x, y);
    if (zValue < 0) // no land?
      return pos;
    pos.add(0, -zValue * WorldHex.maxZ);
    return pos;
  }

  constructor() {
    super();
    // world pos on screen top left
    this.worldTop = 0;
    this.worldLeft = 0;

    this.actMousePosWorldCoordinates = new Vector(0, 0);

    this.cols = -1;
    this.rows = -1;

    this.grid = new Map();
    this.gridTilesDrawOrder = [];
  }

  determineNeighboursForAllTiles(force = false) {
    // find neighbours
    for (const key of this.grid.keys()) {
      const actSpot = this.grid.get(key);
      this.determineNeighbours(actSpot, force);
    }
  }

  determineNeighbours(spot, force = false) {
    if (force)
      spot.neighbours = [];

    if (spot.neighbours.length > 0) // if already neighbors -> finished
      return;

    const actVec = spot.pos;

    for (const y of [-1, 1]) {
      const neighbourVec = new Vector(0, y).addVec(actVec);
      const neighbour = this.grid.get(neighbourVec.toString());
      if (neighbour)
        spot.addNeighbour(neighbour);
    }

    for (const x of [-1, 1]) {
      const yValues = actVec.x % 2 === 0 ? [-1, 0] : [0, 1];
      for (const y of yValues) {
        const neighbourVec = new Vector(x, y).addVec(actVec);
        const neighbour = this.grid.get(neighbourVec.toString());
        if (neighbour)
          spot.addNeighbour(neighbour);
      }
    }
  }

  generateTilesInViewArea() {
    for (let r = this.worldTop - WorldHex.maxZ; r < this.rows + WorldHex.maxZ; r++) {
      for (let c = this.worldLeft - 1; c < this.cols + 1; c++) {
        const pos = new Vector(c, r);
        this.createTileIfNotExists(pos);
      }
    }
  }

  createTileIfNotExists(pos) {
    const key = pos.toString();
    let spotHex = this.grid.get(key);
    if (spotHex) // already in map?
      return spotHex;
    const zValue = getNoiseValAt(pos.x, pos.y);
    if (zValue < 0) // no land?
      return null;
    spotHex = new SpotHex(pos, zValue * WorldHex.maxZ);
    this.grid.set(key, spotHex);
    return spotHex;
  }

  createHoles() {
    for (let i = 0; i < this.cols * this.rows / 2.5; i++) {
      const col = Math.floor(Math.random() * this.cols);
      const row = Math.floor(Math.random() * this.rows);
      if (col === this.cols - 1 && row === this.rows - 1 || col === 0 && row === 0)
        continue;
      this.grid.delete(new Vector(col, row).toString());
    }
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
    return this.createTileIfNotExists(new Vector(x, y));
  }

  getStart() {
    return this.getSpot(0, 0);
  }

  getEnd() {
    return this.getSpot(this.cols - 1, this.rows - 1);
  }

  worldUpdate(worldWidth, worldHeight) {
    const colsWouldBe = Math.floor(WorldHex.widthTilesFactor * worldWidth);
    const rowsWouldBe = Math.floor(WorldHex.heightTilesFactor * worldHeight);
    if (this.cols !== colsWouldBe || this.rows !== rowsWouldBe) {
      this.cols = colsWouldBe;
      this.rows = rowsWouldBe;

      this.generateTilesInViewArea();

      this.calcDrawOrder();
    }
  }

  updateMouseWorldPos(worldWidth, worldHeight) {
    const screenActMousePos = actMousePos;
    this.actMousePosWorldCoordinates.set(
        Math.round((screenActMousePos.x + SpotHex.r) / worldWidth * (this.cols - 1)),
        Math.round((screenActMousePos.y - WorldHex.maxZ) / worldHeight * (this.rows + 0.5))
    );
    // console.log(this.actMousePosWorldCoordinates);
  }

  scale(ctx, worldWidth, worldHeight) {
    ctx.scale(
        worldWidth / ((this.cols - 1) * SpotHex.xStep + 2 * SpotHex.r),
        worldHeight / ((this.rows + 0.5) * SpotHex.height + WorldHex.maxZ)
    );
    ctx.translate(SpotHex.r, SpotHex.r * Math.sin(SpotHex.a) + WorldHex.maxZ);
  }

  draw(ctx) {
    for (const spot of this.gridTilesDrawOrder) {
      spot.draw(ctx);
    }
  }
}