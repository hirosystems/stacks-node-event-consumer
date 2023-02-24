const cp = require('child_process');
const fs = require('fs');
const http = require('http');

let eventId = 0;
if (fs.existsSync(process.env.BOOTSTRAP_EVENTS_FILE)) {
  const lastLine = cp.execSync(`tail -n 1 ${process.env.BOOTSTRAP_EVENTS_FILE}`).toString();
  const id = parseInt(lastLine.split('\t')[0]);
  eventId = Number.isNaN(id) ? eventId : id;
}

const fd = fs.openSync(process.env.BOOTSTRAP_EVENTS_FILE, 'a');
http.createServer((req, res) => {
  fs.appendFileSync(fd, `${++eventId}\t${Date.now()}\t${req.url}\t`);
  req
    .on('data', chunk => fs.appendFileSync(fd, chunk))
    .on('end', () => {
      fs.appendFileSync(fd, '\n');
      res.writeHead(200).end();
    });
}).listen(3998, '0.0.0.0');
