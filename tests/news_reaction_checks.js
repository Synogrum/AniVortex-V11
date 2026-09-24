const fs = require('fs');
const path = require('path');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'build-manifest.json'),'utf8'));
const modules = manifest.js_bundles?.['main.js'] || [];
if (modules.includes('main/03-series-schedule.js')) {
  console.error('FAIL - legacy news reaction module is still bundled');
  process.exit(1);
}
const activePath = path.join(__dirname,'..','src','js','main','03-series-schedule.js');
if (fs.existsSync(activePath)) {
  console.error('FAIL - legacy news reaction module still exists in active source');
  process.exit(1);
}
console.log('PASS - legacy news reaction handlers are excluded from production');
