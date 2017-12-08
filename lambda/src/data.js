const Promise = require("bluebird");
const AWS = require("aws-sdk");
const { iotEndpoint, bucketName, key } = require("./config");
const generatePatch = require("./generatePatch");

const s3 = Promise.promisifyAll(new AWS.S3());
const iotData = Promise.promisifyAll(new AWS.IotData({
    endpoint: iotEndpoint
}));

const iotTopic = [bucketName, key].join("/");

let dataCache;
let dataCacheLastUpdate;

const public = module.exports = {
    get: () => {
        if (dataCache && Date.now() - dataCacheLastUpdate <= 100) {
            //Use data cache if something is cached and it is older than 100ms
            return Promise.resolve(dataCache);
        }

        return s3.getObjectAsync({
            Bucket: bucketName,
            Key: key
        }).then(objectData => JSON.parse(objectData.Body)).then(data => {
            dataCache = data;
            dataCacheLastUpdate = Date.now();

            return data;
        });
    },

    update: updatedData => public.get().then(oldData => {
        const newData = Object.assign(
            {
                _version: null //make sure `_version` is the first key
            },
            updatedData
        );
        newData._version = oldData._version + 1; //Make sure we set the version and not the user

        const patch = generatePatch(oldData, newData);
        if (Object.keys(patch).length === 1) {
            //Dont do anything if only the version changed
            return [];
        }

        return Promise.all([
            s3.putObjectAsync({
                Bucket: bucketName,
                Key: key,
                Body: JSON.stringify(newData),
                StorageClass: "STANDARD",
                CacheControl: "public, max-age=31536000, no-cache",
                ContentType: "application/json",
                ACL: "public-read"
            }),
            iotData.publishAsync({
                topic: iotTopic,
                payload: JSON.stringify(patch)
            })
        ]);
    }),

    updateStreams: updatedStreams => public.get().then(oldData => {
        if (!Array.isArray(updatedStreams)) {
            throw {
                message: "Updated streams need to be an array!"
            };
        }

        for (const stream of updatedStreams) {
            if (typeof stream !== "object") {
                throw {
                    message: "Your updated streams json seems to be malformed. Every stream needs to be an object."
                };
            }
        }

        const data = Object.assign(
            {},
            oldData,
            {
                streams: updatedStreams.filter(stream => stream.link && stream.link.length > 0)
            }
        );

        return public.update(data);
    })
};
