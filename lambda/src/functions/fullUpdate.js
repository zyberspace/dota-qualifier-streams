const data = require("../data");
const buildResponse = require("../buildResponse");

module.exports = (updatedJson, callback) => {
    const updatedData = JSON.parse(updatedJson);
    data.update(updatedData).then(([s3PutResponse, iotPublishResponse]) => {
        callback(null, buildResponse({
            success: true,
            s3PutResponse,
            iotPublishResponse
        }));
    }).catch(err => {
        callback(err, buildResponse({
            err
        }, 400))
    });
};
