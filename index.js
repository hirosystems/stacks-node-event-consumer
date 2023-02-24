const cp = require('child_process');
const fs = require('fs');
const fastify = require("fastify")();

let eventId = 0;
if (fs.existsSync(process.env.BOOTSTRAP_EVENTS_FILE)) {
  const lastLine = cp.execSync(`tail -n 1 ${process.env.BOOTSTRAP_EVENTS_FILE}`).toString();
  const id = parseInt(lastLine.split('\t')[0]);
  eventId = Number.isNaN(id) ? eventId : id;
}

const fd = fs.openSync(process.env.BOOTSTRAP_EVENTS_FILE, 'a');
fastify.post('*', function (request, reply) {
  fs.appendFileSync(fd, `${++eventId}\t${Date.now()}\t${request.url}\t${JSON.stringify(request.body)}\n`);
  reply.code(200).send();
});
fastify.listen({ host: '0.0.0.0', port: 3998 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
