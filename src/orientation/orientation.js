// =============================================================================
// Slate.js | Orientation Events
// (c) Mathigon
// =============================================================================



import { clamp } from '@mathigon/core';
import { round } from '@mathigon/fermat';
import { Browser } from '@mathigon/boost';


export function orientation(callback) {
  let magicNumber = 20;  // Angle that counts as +/- 1
  let friction = 0.1;
  let portrait = null;

  let cx = 0, cy = 0;  // Calibration
  let ix = 0, iy = 0;  // Input
  let vx = 0, vy = 0;  // Velocity

  if (Browser.isMobile && window.DeviceOrientationEvent) {
    // window.addEventListener('deviceorientation', onDeviceOrientation);
  } else {
    window.addEventListener('mousemove', onMouseMove);
  }

  function onAnimationFrame() {
    let vxOld = vx, vyOld = vy;
    vx = round(vx + (ix - vx) * friction, 3);
    vy = round(vy + (iy - vy) * friction, 3);

    if (vx != vxOld || vy != vyOld) callback(-vx, -vy);
    requestAnimationFrame(onAnimationFrame);
  }
  requestAnimationFrame(onAnimationFrame);

  function onDeviceOrientation(event) {
    let newPortrait = Browser.height > Browser.width;
    if (portrait !== newPortrait) {
      portrait = newPortrait;
      cx = event.beta;
      cy = event.gamma;
    }

    ix = -clamp((event.beta - cx) / magicNumber, -1, 1);
    iy = -clamp((event.gamma - cy) / magicNumber, -1, 1);
    if (portrait) [ix, iy] = [iy, ix];
  }

  function onMouseMove(event) {
    ix = event.clientX / Browser.width * 2 - 1;
    iy = event.clientY / Browser.height * 2 - 1;
  }

}
