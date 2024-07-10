import {scale} from "../util/utils.mjs";

// const openSimplex = openSimplexNoise(Date.now()); // random
const openSimplex = openSimplexNoise(123456789); // fix
const factor = 0.1;

const getNoiseValAt = (x, y) => {
  return scale(openSimplex.noise2D(x * factor, y * factor), -1, 1, -0.5, 1.1);
}


export {
  getNoiseValAt
}