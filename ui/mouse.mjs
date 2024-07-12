import {Vector} from "../util/vector.mjs";

export const actMousePos = new Vector(0, 0);

window.addEventListener("mousemove", function (ev) {
  actMousePos.set(ev.clientX, ev.clientY);
})