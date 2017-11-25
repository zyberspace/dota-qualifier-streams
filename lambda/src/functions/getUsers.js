const users = require("../users");
const buildResponse = require("../buildResponse");

module.exports = (event, callback) => {
    users.getAll(event.headers.Authorization).then(users => {
        callback(null, buildResponse({
            users
        }));
    });
};
