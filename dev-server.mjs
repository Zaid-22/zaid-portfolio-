import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
const arg = process.argv.indexOf('--port');
const port = Number(process.env.PORT || (arg >= 0 ? process.argv[arg + 1] : 4173));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2','.svg':'image/svg+xml'};
createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://local').pathname);
    const file = resolve(root, '.' + (path === '/' ? '/index.html' : path));
    if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const data = await readFile(file);
    res.writeHead(200, {'content-type':types[extname(file)] || 'application/octet-stream','cache-control':'no-store'});
    res.end(data);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(port, '0.0.0.0', () => console.log('Portfolio preview ready on port ' + port));
