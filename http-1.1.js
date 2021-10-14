const http = require('http');
const path = require('path');
const fs = require('fs');
const { URL } = require('url');

// 获取资源文件夹目录
const staticDir = path.resolve(__dirname, './static');

// 创建Http1.1协议
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost:2000/').pathname;
  if (pathname === '/') {
    fs.createReadStream(path.resolve(staticDir, 'index.html')).pipe(res);
  } else {
    const fileUrl = path.join(staticDir, pathname);
    try {
      // 首先检查用户指定的文件或目录的权限 检查是否存在，以及是否可读或可写都可以通过fs.access
      fs.accessSync(fileUrl);
      fs.createReadStream(fileUrl).pipe(res);
    } catch {
      res.statusCode = 404;
      res.end('Not Found');
    }
  }
});

server.listen(2000);
