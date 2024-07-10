import {WorldHex} from "./world/worldhex.mjs";
import {AStar} from "./util/astar.mjs";

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

  if (worldUpdated) {
    worldUpdated = false;
    world.worldUpdate(worldWidth, worldHeight);
    if (!aStar) {
      world.determineNeighboursForAllTiles();
      aStar = new AStar(world.getStart(), world.getEnd());
      let finished = false;
      do {
        finished = aStar.next();
      } while (!finished);
    }
  }

  ctx.clearRect(0, 0, worldWidth, worldHeight);

  ctx.save();

  if (world) {
    world.scale(ctx, worldWidth, worldHeight);
    world.draw(ctx);

    if (aStar)
      aStar.draw(ctx);
    // TODO redraw world only if size changed - otherwise store image and draw image
    // TODO move world
  }

  ctx.restore();

  updateWorldSettings();

  requestAnimationFrame(update);
}

update();