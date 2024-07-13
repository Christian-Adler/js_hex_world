import {WorldHex} from "./world/worldhex.mjs";
import {AStar} from "./util/astar.mjs";
import {initControls} from "./ui/controls.mjs";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

let worldWidth = canvas.width;
let worldHeight = canvas.height;
let worldWidth2 = worldWidth / 2;
let worldHeight2 = worldHeight / 2;
let worldUpdated = true;

const updateWorldSettings = () => {
  if (worldHeight !== window.innerHeight || worldWidth !== window.innerWidth) {
    worldWidth = window.innerWidth;
    worldHeight = window.innerHeight;
    worldWidth2 = worldWidth / 2;
    worldHeight2 = worldHeight / 2;
    canvas.width = worldWidth;
    canvas.height = worldHeight;
    worldUpdated = true;
  }
};

updateWorldSettings();

const world = new WorldHex();
let aStar;

const update = () => {

  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;

  const worldUpdateRequired = worldUpdated;
  worldUpdated = false;

  if (worldUpdateRequired) {
    world.worldUpdate(worldWidth, worldHeight);

    if (!aStar) {
      world.determineNeighboursForAllTiles();
      aStar = new AStar();
      initControls(aStar);
      aStar.start = world.getStart();
      aStar.end = world.getEnd();
      aStar.calcPath();
    }
  }

  ctx.clearRect(0, 0, worldWidth, worldHeight);


  { // >> World coordinates
    ctx.save();
    world.scale(ctx, worldWidth, worldHeight);

    if (worldUpdateRequired)
      world.worldUpdateTilesPixelPos(ctx);

    world.draw(ctx);

    world.highlightMousePos(ctx);

    if (aStar)
      aStar.draw(ctx);

    ctx.restore();
  } // << World coordinates


  { // pixel coordinates >>
    // for debugging - show tile pos in real pixel coordinates
    // world.drawPixelCoordinates(ctx);
  }// << pixel coordinates

  updateWorldSettings();

  requestAnimationFrame(update);
}

update();