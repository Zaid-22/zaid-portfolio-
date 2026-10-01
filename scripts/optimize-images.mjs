import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';

const original = new URL('../design/connected-layers.png', import.meta.url);
const output = new URL('../dist/assets/', import.meta.url);
await mkdir(output, { recursive: true });

for (const width of [480, 768, 1024]) {
  for (const format of ['avif', 'webp']) {
    const destination = new URL(`connected-layers-${width}.${format}`, output);
    const image = sharp(original.pathname).resize({ width });
    if (format === 'avif') image.avif({ quality: 55, effort: 6 });
    else image.webp({ quality: 82, effort: 6 });
    await image.toFile(destination.pathname);
    console.log(
      `${destination.pathname.split('/').pop()}: ${(await stat(destination)).size} bytes`,
    );
  }
}

// A deterministic brand card: exact text and colors, using the existing artwork.
const artwork = await sharp(original.pathname).resize(620, 620).toBuffer();
const labels = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="fade"><stop offset="0" stop-color="#0e1011"/><stop offset="1" stop-color="#0e1011" stop-opacity="0"/></linearGradient></defs>
  <rect x="515" y="0" width="160" height="630" fill="url(#fade)"/>
  <g font-family="Arial, Helvetica, sans-serif">
    <text x="66" y="100" fill="#c7f76b" font-size="48" font-weight="700">z.</text>
    <text x="65" y="235" fill="#f3f5ed" font-size="63" letter-spacing="-2">Zaid Asaireh</text>
    <text x="66" y="308" fill="#c7f76b" font-size="49" letter-spacing="-1">Full-stack developer.</text>
    <text x="68" y="380" fill="#cdd3cd" font-size="28">ASP.NET Core · React · Next.js</text>
    <text x="68" y="428" fill="#a5aaa8" font-size="23">JavaScript · TypeScript · SQL Server</text>
    <line x1="68" y1="490" x2="495" y2="490" stroke="#303536"/>
    <text x="68" y="538" fill="#a5aaa8" font-size="20">Amman, Jordan</text>
  </g>
</svg>`);

await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#0e1011' } })
  .composite([{ input: artwork, left: 580, top: 5 }, { input: labels }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(new URL('social-preview.jpg', output).pathname);
