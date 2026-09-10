const fs = require('fs');
const path = require('path');

const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKElEQVR42mNk+M9Qz0ABYBw1gGE0DBhGwwAYDYPBGA2DwYAMh74GAA7tAxF2jN77AAAAAElFTkSuQmCC';
const png = Buffer.from(pngBase64, 'base64');

// Standard ICO header for a 16x16 PNG icon
const icoHeader = Buffer.from([
  0, 0, // reserved
  1, 0, // 1 = ICO
  1, 0, // 1 image
  16,   // width 16
  16,   // height 16
  0,    // 0 colors in palette
  0,    // reserved
  1, 0, // color planes
  32, 0 // bits per pixel
]);

const sizeBuf = Buffer.alloc(4);
sizeBuf.writeUInt32LE(png.length, 0);

const offsetBuf = Buffer.alloc(4);
offsetBuf.writeUInt32LE(6 + 16, 0); // header (6) + directory entry (16) = 22

const ico = Buffer.concat([icoHeader, sizeBuf, offsetBuf, png]);
const outPath = path.join(__dirname, '..', 'public', 'favicon.ico');
fs.writeFileSync(outPath, ico);
console.log('[PrepForge] Generated public/favicon.ico successfully! Size:', ico.length);
