const fullUpdate = require("./src/functions/fullUpdate");

module.exports.fullUpdate = (event, context, callback) => {
    fullUpdate(event.body, callback);
};
