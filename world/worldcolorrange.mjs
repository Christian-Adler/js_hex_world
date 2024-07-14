import {HSL} from "../util/hsl.mjs";
import {lerp, scale} from "../util/utils.mjs";

const colors = [new HSL(120), new HSL(84), new HSL(92, 100, 19), new HSL(92, 0, 19), new HSL(92, 0, 100)];

/**
 * Returns World HSL color
 * @param val 0-1 low to high
 */
export const getWorldColor = (val) => {
  let slotIdx = Math.floor((colors.length - 1) * val);
  if (slotIdx < 0)
    return colors[0].clone();
  if (slotIdx >= colors.length - 1)
    return colors[colors.length - 1].clone();
  
  const color1 = colors[slotIdx];
  const color2 = colors[slotIdx + 1];

  const slotWidth = 1 / (colors.length - 1);
  const slotVal = val % slotWidth;
  const t = scale(slotVal, 0, slotWidth, 0, 1);

  // noinspection UnnecessaryLocalVariableJS
  const worldColor = new HSL(lerp(color1.h, color2.h, t), lerp(color1.s, color2.s, t), lerp(color1.l, color2.l, t), lerp(color1.a, color2.a, t));
  return worldColor;
};