export const pressedSpecialKeys = {
  alt: false,
  ctrl: false,
  shift: false,
}

window.addEventListener("keydown", (ev) => {
  ev.preventDefault();
  if (ev.altKey)
    pressedSpecialKeys.alt = true;
  if (ev.ctrlKey)
    pressedSpecialKeys.ctrl = true;
  if (ev.shiftKey)
    pressedSpecialKeys.shift = true;
  return false;
});
window.addEventListener("keyup", (ev) => {
  ev.preventDefault();
  if (!ev.altKey)
    pressedSpecialKeys.alt = false;
  if (!ev.ctrlKey)
    pressedSpecialKeys.ctrl = false;
  if (!ev.shiftKey)
    pressedSpecialKeys.shift = false;
  return false;
});