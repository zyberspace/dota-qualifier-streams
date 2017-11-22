const data = require("../data");
const buildResponse = require("../buildResponse");

module.exports = (updatedStreamsJson, callback) => {
    const updatedStreams = JSON.parse(updatedStreamsJson);
    data.updateStreams(updatedStreams).then(([s3PutResponse, iotPublishResponse]) => {
        callback(null, buildResponse({
            success: true,
            s3PutResponse,
            iotPublishResponse
        }));
    }).catch(error => callback(null, buildResponse({
        error
    }, 500)));
};
