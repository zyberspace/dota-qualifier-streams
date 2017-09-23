oracle.surge.sh
===============

This is the frontend that displays which casters / channels are streaming the current qualifiers.  
In the future the data will get retrieved via a Lambda function and kept up-to-date with an AWS IoT pubsub stream via websockets.

Developing
----------

```
git clone https://github.com/zyberspace/dota-qualifier-streams
cd dota-qualifier-streams/oracle.surge.sh
npm install
npm run watch
#Make your changes
```
