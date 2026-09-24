const fs = require('fs');
const vm = require('vm');
const path = require('path');

function fail(message) {
  console.error('FAIL - ' + message);
  process.exit(1);
}

// Popup manager behavior
{
  const file = path.join(__dirname, '..', 'src', 'js', 'components', 'popup-manager.js');
  const listeners = [];
  const windowObj = {
    innerWidth: 500,
    innerHeight: 400,
    AniVortexPerf: { rafThrottle: fn => fn },
    addEventListener(type, fn) { listeners.push(['window', type, fn]); },
    removeEventListener() {},
  };
  const documentObj = {
    addEventListener(type, fn) { listeners.push(['document', type, fn]); },
    removeEventListener() {},
  };
  const context = { window: windowObj, document: documentObj, Object, Number, Math, TypeError };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(file, 'utf8'), context);
  const manager = windowObj.AniVortexPopup;
  if (!manager) fail('AniVortexPopup missing');

  const popup = {
    style: {}, dataset: {}, offsetWidth: 100, offsetHeight: 80,
    getBoundingClientRect() { return { left:0, top:0, right:100, bottom:80, width:100, height:80 }; }
  };
  const anchor = { getBoundingClientRect() { return { left:400, top:100, right:450, bottom:150, width:50, height:50 }; } };
  const placed = manager.placeAdjacent(popup, anchor, { prefer:'right', fallback:'left', gap:12, safe:8, vertical:'top' });
  if (placed.side !== 'left') fail('popup fallback side should be left when right side does not fit');
  if (Math.round(placed.left) !== 288) fail('popup left placement geometry changed');
  if (popup.style.left !== '288px' || popup.style.top !== '100px') fail('popup placement was not applied');

  let tracked = 0;
  const tracking = manager.bindViewportTracking(() => { tracked += 1; }, { wheel:true });
  if (typeof tracking.schedule !== 'function' || typeof tracking.destroy !== 'function') fail('viewport tracking contract invalid');
  tracking.schedule();
  if (tracked !== 1) fail('viewport tracking scheduler did not run callback');
}

// Carousel manager behavior
{
  const file = path.join(__dirname, '..', 'src', 'js', 'components', 'carousel-manager.js');
  let timerId = 0;
  const timers = new Map();
  const windowObj = {
    AniVortexPerf: {
      canRunAutoMotion: () => true,
      onAutoMotionChange: () => () => {},
    },
    setInterval(fn, ms) { const id = ++timerId; timers.set(id, {fn, ms}); return id; },
    clearInterval(id) { timers.delete(id); },
  };
  const context = { window: windowObj, document: { activeElement:null }, Node: function Node(){}, Object, Number, Math, TypeError };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(file, 'utf8'), context);
  const manager = windowObj.AniVortexCarousel;
  if (!manager) fail('AniVortexCarousel missing');
  let ticks = 0;
  const controller = manager.createAutoplayController({ interval: 4321, tick: () => { ticks += 1; } });
  if (!controller.start() || timers.size !== 1) fail('autoplay controller did not start');
  const timer = [...timers.values()][0];
  if (timer.ms !== 4321) fail('autoplay controller interval changed');
  timer.fn();
  if (ticks !== 1) fail('autoplay controller tick did not execute');
  controller.stop();
  if (timers.size !== 0 || controller.isRunning()) fail('autoplay controller did not stop cleanly');
}

console.log('PASS - shared manager behavior checks passed');
