const fullUpdate = require("./src/functions/fullUpdate");
const updateStreams = require("./src/functions/updateStreams");
const getUsers = require("./src/functions/getUsers");

module.exports.fullUpdate = (event, context, callback) => {
    fullUpdate(event.body, callback);
};

module.exports.updateStreams = (event, context, callback) => {
    updateStreams(event.body, callback);
};

module.exports.getUsers = (event, context, callback) => {
    getUsers(event, callback);
};
