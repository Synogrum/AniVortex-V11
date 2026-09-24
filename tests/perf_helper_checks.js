const fs = require('fs');
const vm = require('vm');
const path = require('path');

const file = path.join(__dirname, '..', 'src', 'js', 'components', 'perf.js');
if (!fs.existsSync(file)) {
  console.error('FAIL - missing src/js/components/perf.js');
  process.exit(1);
}

let queued = [];
const context = {
  window: {},
  requestAnimationFrame(cb) { queued.push(cb); return queued.length; },
  cancelAnimationFrame() {},
};
context.window.window = context.window;
context.window.requestAnimationFrame = context.requestAnimationFrame;
context.window.cancelAnimationFrame = context.cancelAnimationFrame;
vm.createContext(context);
vm.runInContext(fs.readFileSync(file, 'utf8'), context);

const perf = context.window.AniVortexPerf;
if (!perf || typeof perf.rafThrottle !== 'function') {
  console.error('FAIL - AniVortexPerf.rafThrottle missing');
  process.exit(1);
}
if (typeof perf.canRunAutoMotion !== 'function' || typeof perf.onAutoMotionChange !== 'function') {
  console.error('FAIL - auto-motion helpers missing');
  process.exit(1);
}

const calls = [];
const throttled = perf.rafThrottle((value) => calls.push(value));
throttled(1);
throttled(2);
throttled(3);
if (queued.length !== 1 || calls.length !== 0) {
  console.error('FAIL - rafThrottle should queue exactly one frame');
  process.exit(1);
}
queued.shift()();
if (calls.length !== 1 || calls[0] !== 3) {
  console.error('FAIL - rafThrottle must use latest arguments');
  process.exit(1);
}
throttled(4);
if (queued.length !== 1) {
  console.error('FAIL - rafThrottle did not schedule next frame');
  process.exit(1);
}
queued.shift()();
if (calls[1] !== 4) {
  console.error('FAIL - second frame value incorrect');
  process.exit(1);
}
console.log('PASS - performance helper checks passed');
