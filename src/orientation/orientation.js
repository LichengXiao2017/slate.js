// =============================================================================
// Slate.js | Orientation Events
// (c) 2017 Mathigon
// =============================================================================



import { clamp } from 'utilities';
import Browser from 'browser';


export function orientation(callback) {
  let magicNumber = 20;  // Angle that counts as +/- 1
  let friction = 0.05;
  let portrait = null;

  let cx = 0, cy = 0;  // Calibration
  let ix = 0, iy = 0;  // Input
  let vx = 0, vy = 0;  // Velocity

  if (Browser.isMobile && window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', onDeviceOrientation);
  } else {
    window.addEventListener('mousemove', onMouseMove);
  }

  requestAnimationFrame(onAnimationFrame);
  queueCalibration(calibrationDelay);

  function onAnimationFrame() {
    vx += (ix - vx) * friction;
    vy += (iy - vy) * friction;

    callback(-vx, -vy);
    requestAnimationFrame(onAnimationFrame);
  }

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
