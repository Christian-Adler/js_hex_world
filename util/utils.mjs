import {Vector} from "./vector.mjs";

const lerp = (a, b, t) => {
  return a + (b - a) * t;
};
const lerpVec = (a, b, t) => {
  return new Vector(lerp(a.x, b.x, t), lerp(a.y, b.y, t));
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
const getRandomIntInclusive = (min, max) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

const rad2deg = (rad) => {
  return 360 * rad / (Math.PI * 2);
}

const deg2rad = (deg) => {
  return deg / 360 * (Math.PI * 2);
}

const scale = (number, inMin, inMax, outMin, outMax) => {
  return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

export {lerp, lerpVec, getRandomIntInclusive, rad2deg, deg2rad, scale}