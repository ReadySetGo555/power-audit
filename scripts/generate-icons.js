const zlib = require("zlib");
const fs = require("fs");

function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function crc32(buf) {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let v = n;
    for (let k = 0; k < 8; k++) v = v & 1 ? 0xedb88320 ^ (v >>> 1) : v >>> 1;
    t[n] = v;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const d = Buffer.isBuffer(data) ? data : Buffer.from(data);
  return Buffer.concat([u32(d.length), t, d, u32(crc32(Buffer.concat([t, d])))]);
}

function solidPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const hdr = Buffer.alloc(13);
  hdr.writeUInt32BE(size, 0);
  hdr.writeUInt32BE(size, 4);
  hdr[8] = 8; hdr[9] = 2;
  const row = Buffer.alloc(1 + size * 3);
  for (let x = 0; x < size; x++) { row[1 + x * 3] = r; row[1 + x * 3 + 1] = g; row[1 + x * 3 + 2] = b; }
  const raw = Buffer.alloc((1 + size * 3) * size);
  for (let y = 0; y < size; y++) row.copy(raw, y * (1 + size * 3));
  return Buffer.concat([sig, chunk("IHDR", hdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

fs.mkdirSync("public/icons", { recursive: true });
fs.writeFileSync("public/icons/icon-192.png", solidPNG(192, 124, 92, 191));
fs.writeFileSync("public/icons/icon-512.png", solidPNG(512, 124, 92, 191));
fs.writeFileSync("public/icons/apple-touch-icon.png", solidPNG(180, 124, 92, 191));
console.log("Icons generated: 192, 512, apple-touch-icon");
