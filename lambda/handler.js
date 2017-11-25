const fullUpdate = require("./src/functions/fullUpdate");
const updateStreams = require("./src/functions/updateStreams");
const getUsers = require("./src/functions/getUsers");
const updateUser = require("./src/functions/updateUser");
const deleteUser = require("./src/functions/deleteUser");

module.exports.fullUpdate = (event, context, callback) => {
    fullUpdate(event.body, callback);
};

module.exports.updateStreams = (event, context, callback) => {
    updateStreams(event.body, callback);
};

module.exports.getUsers = (event, context, callback) => {
    getUsers(event, callback);
};

module.exports.updateUser = (event, context, callback) => {
    updateUser(event, callback);
};

module.exports.deleteUser = (event, context, callback) => {
    deleteUser(event, callback);
};
