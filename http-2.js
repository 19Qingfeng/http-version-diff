const http2 = require('http2');
const fs = require('fs');
const path = require('path');
const { HTTP2_HEADER_PATH, HTTP2_HEADER_STATUS } = http2.constants;

const server = http2.createSecureServer({
  cert: fs.readFileSync(path.resolve(__dirname, './cert.crt')),
  key: fs.readFileSync(path.resolve(__dirname, './rsa_private.key')),
});

const staticDir = path.resolve(__dirname, './static');

server.on('stream', (stream, headers) => {
  const requestPath = headers[HTTP2_HEADER_PATH];
  console.log(requestPath,'requestPath')
  if (requestPath === '/') {
    // 跟路径 server push
    const staticFiles = fs.readdirSync(staticDir);
    staticFiles.forEach((filePath) => {
      const pushFilePath = path.join(staticDir, filePath);
      stream.pushStream(
        { [HTTP2_HEADER_PATH]: '/' + filePath },
        (err, pushStream) => {
          fs.createReadStream(pushFilePath).pipe(pushStream);
        }
      );
      stream.respondWithFile(path.join(__dirname, './static', 'index.html'), {
        'Content-Type': 'text/html',
      });
    });
  } else {
    stream.respond({
      [HTTP2_HEADER_STATUS]: 404,
    });
    stream.end('not found');
  }
});

server.listen(2000);
