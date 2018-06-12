oracle.surge.sh
===============

This is the frontend that displays which casters / channels are streaming the current qualifiers.  
The data gets loaded from a json file hosted on S3 and kept up-to-date with an AWS IoT pubsub stream via websockets.

Developing
----------

```
git clone https://github.com/zyberspace/dota-qualifier-streams
cd dota-qualifier-streams/frontend
npm install
npm run watch
#Make your changes
```
