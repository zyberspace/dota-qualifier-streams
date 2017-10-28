const Promise = require("bluebird");
const AWS = require("aws-sdk");
const { iotEndpoint, bucketName, key } = require("./config");
const generatePatch = require("./generatePatch");

const s3 = Promise.promisifyAll(new AWS.S3());
const iotData = Promise.promisifyAll(new AWS.IotData({
    endpoint: iotEndpoint
}));

const iotTopic = [bucketName, key].join("/");

const public = module.exports = {
    get: () => s3.getObjectAsync({
        Bucket: bucketName,
        Key: key
    }).then(objectData => JSON.parse(objectData.Body)),

    update: updatedData => public.get().then(oldData => {
        const newData = Object.assign(
            {
                _version: null //make sure `_version` is the first key
            },
            updatedData
        );
        newData._version = oldData._version + 1; //Make sure we set the version and not the user

        const patch =  generatePatch(oldData, newData);

        return Promise.all([
            s3.putObjectAsync({
                Bucket: bucketName,
                Key: key,
                Body: JSON.stringify(newData),
                StorageClass: "STANDARD_IA",
                CacheControl: "public, max-age=31536000, no-cache",
                ContentType: "application/json",
                ACL: "public-read"
            }),
            iotData.publishAsync({
                topic: iotTopic,
                payload: JSON.stringify(patch)
            })
        ]);
    })
};
