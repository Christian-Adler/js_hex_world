import {Vector} from "../util/vector.mjs";

const actMousePos = new Vector(0, 0);

window.addEventListener("mousemove", function (ev) {
  actMousePos.set(ev.clientX, ev.clientY);
});

const initWheelListenerForWorld = (world) => {
  window.addEventListener("wheel", function (ev) {
    // ev.preventDefault();
    world.updateActMouseSpotZ(ev.deltaY * -0.01);
  });
}

// stimmt nicht bei hex-grid
const actMousePosInTransformCoordinates = (ctx) => {
  const transform = ctx.getTransform();

  if (transform.isIdentity)
    return actMousePos.clone();

  const matrix = new DOMMatrixReadOnly(transform);

  const invertedMatrix = matrix.inverse();

  const transformedPoint = invertedMatrix.transformPoint(actMousePos);
  //   const canvasPos = {
//     x: Math.round(actMousePos.x * invMat.a + actMousePos.y * invMat.c + invMat.e),
//     y: Math.round(actMousePos.x * invMat.b + actMousePos.y * invMat.d + invMat.f)
//   };

  return Vector.fromPoint(transformedPoint);
};

export {actMousePos, actMousePosInTransformCoordinates, initWheelListenerForWorld}