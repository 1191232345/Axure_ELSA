const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const JSON_DIR = path.join(__dirname, 'json');

// 确保 json 目录存在
if (!fs.existsSync(JSON_DIR)) {
  fs.mkdirSync(JSON_DIR);
}

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 保存草稿
  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const filename = `prd-${data.module || 'untitled'}-${Date.now()}.json`;
        fs.writeFileSync(path.join(JSON_DIR, filename), JSON.stringify(data, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, filename }));
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 获取草稿列表
  if (req.method === 'GET' && req.url === '/list') {
    const files = fs.readdirSync(JSON_DIR).filter(f => f.endsWith('.json'));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(files));
    return;
  }

  // 加载草稿
  if (req.method === 'GET' && req.url.startsWith('/load/')) {
    const filename = decodeURIComponent(req.url.slice(6));
    const filepath = path.join(JSON_DIR, filename);
    if (fs.existsSync(filepath)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(fs.readFileSync(filepath));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
    return;
  }

  // 删除草稿
  if (req.method === 'DELETE' && req.url.startsWith('/delete/')) {
    const filename = decodeURIComponent(req.url.slice(8));
    const filepath = path.join(JSON_DIR, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
    return;
  }

  // 更新草稿
  if (req.method === 'POST' && req.url.startsWith('/update/')) {
    const filename = decodeURIComponent(req.url.slice(8));
    const filepath = path.join(JSON_DIR, filename);
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
