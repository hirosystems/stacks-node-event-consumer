#!/usr/bin/env node

const cp = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const outputFile = path.resolve(process.env.BOOTSTRAP_EVENTS_FILE || 'events.tsv');
console.log(`Writing events to file: ${outputFile}`);

let eventId = 0;
if (fs.existsSync(outputFile)) {
  const lastLine = cp.execSync(`tail -n 1 ${outputFile}`).toString();
  const id = parseInt(lastLine.split('\t')[0]);
  eventId = Number.isNaN(id) ? eventId : id;
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
const fd = fs.openSync(outputFile, 'a');
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
}).listen(parseInt(process.env.EVENT_CONSUMER_PORT || 3888), '0.0.0.0', () => {
  console.log('Server started:', server.address());
});

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, sig => {
    console.info(`Received ${sig}, exiting...`);
    server.close(() => process.exit(0));
  });
}
