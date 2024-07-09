import {lerp, scale} from "../util/utils.mjs";
import {WorldHex} from "./worldhex.mjs";

const canvasHM = document.getElementById("heightmap");
const ctxHM = canvasHM.getContext('2d', {willReadFrequently: true});

let width = 100;
let height = 100;
let heightMap;
let heightMapMin = 255;
let heightMapMax = 0;

const loadHeightMap = async () => {
  return new Promise(resolve => {
    const img = new Image();

    img.onload = function () {
      width = img.width;
      height = img.height;
      canvasHM.width = img.width;
      canvasHM.height = img.height;
      //draw background image
      ctxHM.drawImage(img, 0, 0);
      const imgData = ctxHM.getImageData(0, 0, width, height).data;
      heightMap = [];
      for (let i = 0; i < imgData.length; i += 4) {
        const rVal = imgData[i];
        if (rVal > heightMapMax) heightMapMax = rVal;
        if (rVal < heightMapMin) heightMapMin = rVal;
        heightMap.push(rVal);
      }
      resolve();
    };

    img.src = 'heightmap.png';
  })
};

const getZValue = (xPercent, yPercent) => {
  const x = Math.floor(lerp(0, width, xPercent));
  const y = Math.floor(lerp(0, height, yPercent));
  // const i = (y * width + x) * 4; // full Image Data
  const i = (y * width + x);
  // noinspection UnnecessaryLocalVariableJS
  const R = heightMap[i];
  return scale(R, heightMapMin, heightMapMax, 0, 1);
};

export const createWorld = async () => {
  await loadHeightMap();
  return new WorldHex(getZValue);
};