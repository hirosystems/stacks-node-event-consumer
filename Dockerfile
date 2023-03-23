FROM node:18-bullseye
COPY ./index.js /bin/event-ovserver.js

ENV EVENTS_FILE=/data/events.tsv
ENV EVENT_CONSUMER_PORT=3888
EXPOSE $EVENT_CONSUMER_PORT

CMD ["node", "/bin/event-ovserver.js"]
