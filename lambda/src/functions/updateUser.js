const users = require("../users");
const buildResponse = require("../buildResponse");

module.exports = (event, callback) => {
    users.updateOne(event.headers.Authorization, JSON.parse(event.body)).then(dynamoDbResponse => {
        callback(null, buildResponse({
            success: true,
            dynamoDbResponse
        }));
    }).catch(error => callback(null, buildResponse({
        error
    }, 500)));
};
