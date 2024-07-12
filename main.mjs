import {WorldHex} from "./world/worldhex.mjs";
import {AStar} from "./util/astar.mjs";
import {initControls} from "./ui/controls.mjs";
import {SpotHex} from "./world/spothex.mjs";

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
      aStar = new AStar();
      initControls(aStar);
      aStar.start = world.getStart();
      aStar.end = world.getEnd();
      aStar.calcPath();
    }
  }

  ctx.clearRect(0, 0, worldWidth, worldHeight);

  world.updateMouseWorldPos(worldWidth, worldHeight);

  { // >> World coordinates
    ctx.save();
    world.scale(ctx, worldWidth, worldHeight);
    world.draw(ctx);

    if (aStar)
      aStar.draw(ctx);

    const mouseWorld = world.actMousePosWorldCoordinates;
    const pos = WorldHex.calcAdjustedPos(mouseWorld.x, mouseWorld.y);
    ctx.beginPath();
    // ctx.rect(pos.x, pos.y, 1, 1);
    ctx.lineWidth = 0.2;
    let aFactor = 0;
    let r = SpotHex.r * 1.5;
    for (let i = 0; i < 6; i++) {
      ctx.lineTo(pos.x + r * Math.cos(SpotHex.a * i), pos.y + r * Math.sin(SpotHex.a * i));
      aFactor += (i % 2 === 0) ? 1 : 3;
    }
    ctx.closePath();

    // ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    // ctx.fill();
    ctx.stroke();

    ctx.restore();
  } // << World coordinates


  updateWorldSettings();

  requestAnimationFrame(update);
}

update();