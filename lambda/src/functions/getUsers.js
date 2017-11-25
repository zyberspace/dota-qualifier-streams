const Promise = require("bluebird");
const qs = require("querystring");
const AWS = require("aws-sdk");
const fetch = require("node-fetch");
const buildResponse = require("../buildResponse");

const dynamoDb = Promise.promisifyAll(new AWS.DynamoDB());

module.exports = (event, callback) => {
    dynamoDb.scanAsync({
        TableName: "dota-qualifier-streams-users",
        ConsistentRead: true
    }).then(data => {
        let users = [];
        for (const item of data.Items) {
            users.push({
                twitchUserId: item.twitchUserId.N,
                role: item.role.S
            });
        }

        return Promise.all([
            users,
            fetch("https://api.twitch.tv/helix/users?" + qs.stringify({
                id: users.map(user => user.twitchUserId)
            }), {
                headers: {
                    "Authorization": event.headers.Authorization
                }
            }).then(response => response.json())
        ]);
    }).then(([ users, twitchData ]) => {
        const twitchUsers = twitchData.data;
        for (let user of users) {
            const twitchUser = twitchUsers.find(twitchUser => twitchUser.id === user.twitchUserId) || {};
            user.displayName = twitchUser.display_name;
            user.profileImageUrl = twitchUser.profile_image_url;
        }

        callback(null, buildResponse({
            users
        }));
    });
};
