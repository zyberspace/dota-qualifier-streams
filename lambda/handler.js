const fullUpdate = require("./src/functions/fullUpdate");
const updateStreams = require("./src/functions/updateStreams");

module.exports.fullUpdate = (event, context, callback) => {
    fullUpdate(event.body, callback);
};

module.exports.updateStreams = (event, context, callback) => {
    updateStreams(event.body, callback);
};
