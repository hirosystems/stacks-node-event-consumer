const cp = require('child_process');
const fs = require('fs');
const http = require('http');

console.log(`Writing events to file: ${process.env.BOOTSTRAP_EVENTS_FILE}`);

let eventId = 0;
if (fs.existsSync(process.env.BOOTSTRAP_EVENTS_FILE)) {
  const lastLine = cp.execSync(`tail -n 1 ${process.env.BOOTSTRAP_EVENTS_FILE}`).toString();
  const id = parseInt(lastLine.split('\t')[0]);
  eventId = Number.isNaN(id) ? eventId : id;
}

const fd = fs.openSync(process.env.BOOTSTRAP_EVENTS_FILE, 'a');
const server = http.createServer((req, res) => {
  const lineChunks = [Buffer.from(`${++eventId}\t${(new Date()).toISOString()}\t${req.url}\t`)];
  req
    .on('data', chunk => lineChunks.push(chunk))
    .on('end', () => {
      lineChunks.push(Buffer.from('\n'));
      const line = Buffer.concat(lineChunks);
      fs.appendFileSync(fd, line);
      res.writeHead(200).end();
    });
}).listen(3998, '0.0.0.0', () => console.log('Server started:', server.address()));

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, sig => {
    console.info(`Received ${sig}, exiting...`);
    server.close(() => process.exit(0));
  });
}
