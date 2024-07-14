import {Vector} from "../util/vector.mjs";
import {SpotHex} from "./spothex.mjs";
import {getNoiseValAt} from "./heightmap.mjs";
import {actMousePos} from "../ui/mouse.mjs";
import {HSL} from "../util/hsl.mjs";
import {lerp, scale} from "../util/utils.mjs";
import {worldSettings as WorldSettings} from "./worldsettings.mjs";
import {pressedSpecialKeys} from "../ui/keys.mjs";

export class WorldHex {

  constructor() {
    // world pos on screen top left
    this.worldTop = 0;
    this.worldLeft = 0;

    this.cols = -1;
    this.rows = -1;
    this.scaleFactorX = 1;
    this.scaleFactorY = 1;
    this.transform = null;

    this.redrawRequired = false;

    this.grid = new Map();
    this.gridTilesDrawOrder = [];

    this.actMouseSpot = null;
    this.selectedSpot = null;

    this.#initListeners();
  }

  #initListeners() {
    const world = this;
    window.addEventListener("wheel", function (ev) {
      // ev.preventDefault();
      world.#updateSelectedSpotZ(ev.deltaY * -0.003, pressedSpecialKeys.shift);
    });
    window.addEventListener("click", function (ev) {
      world.selectedSpot = world.actMouseSpot;
    });
    window.addEventListener("contextmenu", function (ev) {
      ev.preventDefault();
      world.selectedSpot = null;
      return false;
    });
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

  #generateTilesInViewArea() {
    for (let r = this.worldTop - WorldSettings.maxZ; r < this.rows + WorldSettings.maxZ; r++) {
      for (let c = this.worldLeft - 1; c < this.cols + 1; c++) {
        const pos = new Vector(c, r);
        this.#createTileIfNotExists(pos);
      }
    }
  }

  #createTileIfNotExists(pos) {
    const key = pos.toString();
    let spotHex = this.grid.get(key);
    if (spotHex) // already in map?
      return spotHex;
    const zValue = getNoiseValAt(pos.x, pos.y);
    if (zValue < 0) // no land?
      return null;
    spotHex = new SpotHex(pos, zValue * WorldSettings.maxZ);
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
    return this.#createTileIfNotExists(new Vector(x, y));
  }

  getStart() {
    return this.getSpot(0, 0);
  }

  getEnd() {
    return this.getSpot(this.cols - 1, this.rows - 1);
  }

  worldUpdate(worldWidth, worldHeight) {
    const colsWouldBe = Math.floor(WorldSettings.widthTilesFactor * worldWidth);
    const rowsWouldBe = Math.floor(WorldSettings.heightTilesFactor * worldHeight);
    if (this.cols !== colsWouldBe || this.rows !== rowsWouldBe) {
      this.cols = colsWouldBe;
      this.rows = rowsWouldBe;

      this.#generateTilesInViewArea();

      this.calcDrawOrder();
    }

    this.scaleFactorX = worldWidth / ((this.cols - 1) * SpotHex.xStep + 2 * SpotHex.r);
    this.scaleFactorY = worldHeight / ((this.rows + 0.5) * SpotHex.height + WorldSettings.maxZ);
  }

  worldUpdateTilesPixelPos(ctxWorld) {
    ctxWorld.setTransform(this.transform);

    const matrix = new DOMMatrixReadOnly(this.transform);

    for (const spotHex of this.grid.values()) {
      const pos = spotHex.hexPos.clone();
      pos.add(0, -spotHex.z);
      const transformedPoint = matrix.transformPoint(pos);
      spotHex.pixelPos = Vector.fromPoint(transformedPoint);
    }
  }

  #updateSelectedSpotZ(val, updateNeighbours) {
    const spotHex = this.selectedSpot;
    if (!spotHex)
      return;

    const updateSpots = [];

    if (updateNeighbours) {
      const spots = this.#findNeighboursOf(spotHex, 5);

      for (const spot of spots) {
        const dist = spotHex.distanceToSpot(spot);
        const distT = scale(dist, 0, 5, 0, 1);
        const zUpdateVal = lerp(val, 0, distT);
        if (spot.z + zUpdateVal > 0) {
          spot.z += zUpdateVal;
          updateSpots.push(spot);
        }
      }
    } else {
      if (spotHex.z + val > 0)
        spotHex.z += val;
      updateSpots.push(spotHex);
    }

    if (updateSpots.length > 0)
      this.redrawRequired = true;

    for (const updateSpot of updateSpots) {
      updateSpot.updateWorldColor();

      const matrix = new DOMMatrixReadOnly(this.transform);

      const pos = updateSpot.hexPos.clone();
      pos.add(0, -updateSpot.z);
      const transformedPoint = matrix.transformPoint(pos);
      updateSpot.pixelPos = Vector.fromPoint(transformedPoint);
    }
  }

  #findNeighboursOf(spot, maxDistance) {
    const neighbours = new Set();
    const workList = [spot];

    while (workList.length > 0) {
      const actSpot = workList.splice(0, 1)[0];
      neighbours.add(actSpot);
      const actNeighbours = actSpot.getNeighbours();
      for (const actNeighbour of actNeighbours) {
        if (!neighbours.has(actNeighbour) && spot.distanceToSpot(actNeighbour) <= maxDistance) {
          workList.push(actNeighbour);
        }
      }
    }

    return [...neighbours];
  }

  scale(ctx, worldWidth, worldHeight) {
    ctx.scale(this.scaleFactorX, this.scaleFactorY);
    ctx.translate(SpotHex.r, SpotHex.r * Math.sin(SpotHex.a) + WorldSettings.maxZ);

    // store transform for world canvas context
    this.transform = ctx.getTransform();
  }

  #calcApproximateMouseWorldPos() {
    return new Vector(actMousePos.x / (SpotHex.xStep * this.scaleFactorX), actMousePos.y / (SpotHex.height * this.scaleFactorY)).round();
  }

  determineActMouseSpot() {
    // find nearest mouse pos Spot
    const actMouse = actMousePos;
    // console.log('actMouse', actMouse);
    const mouseWorldPos = this.#calcApproximateMouseWorldPos();
    // console.log('mouseWorldPos', mouseWorldPos);
    let nearestSpot = null;
    let nearestSpotDiff = Number.MAX_SAFE_INTEGER;
    for (let x = mouseWorldPos.x - 1; x <= mouseWorldPos.x + 1; x++) {
      for (let y = mouseWorldPos.y - 5; y <= mouseWorldPos.y + 5; y++) {
        const actSpot = this.getSpot(x, y);
        if (actSpot) {
          const dist2Mouse = actSpot.pixelPos.distance(actMouse);
          // console.log(dist2Mouse);
          if (!nearestSpot) {
            nearestSpot = actSpot;
            nearestSpotDiff = dist2Mouse;
          } else if (dist2Mouse < nearestSpotDiff) {
            nearestSpotDiff = dist2Mouse;
            nearestSpot = actSpot;
          }
        }
      }
    }

    if (nearestSpot) {
      this.actMouseSpot = nearestSpot;
      // console.log('nearest pixelpos', nearestSpot.pixelPos);
    }
  }

  draw(ctxWorld) {
    this.redrawRequired = false;
    for (const spot of this.gridTilesDrawOrder) {
      spot.draw(ctxWorld);
    }
  }

  drawPixelCoordinates(ctx) {
    ctx.fillStyle = 'white';
    for (const hexSpot of this.gridTilesDrawOrder) {
      ctx.beginPath();
      ctx.rect(hexSpot.pixelPos.x, hexSpot.pixelPos.y, 5, 5);
      ctx.fill();
    }
  }

  highlightMousePos(ctxWorld) {
    if (this.selectedSpot) {
      this.selectedSpot.drawHighlight(ctxWorld, new HSL());
    }
    if (this.actMouseSpot) {
      // this._actMouseSpot.draw(ctxWorld, new HSL());
      this.actMouseSpot.drawHighlight(ctxWorld);
    }
  }
}