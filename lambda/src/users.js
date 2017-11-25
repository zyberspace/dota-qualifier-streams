const Promise = require("bluebird");
const qs = require("querystring");
const AWS = require("aws-sdk");
const fetch = require("node-fetch");

const dynamoDb = Promise.promisifyAll(new AWS.DynamoDB());
const dynamoDbCommonParams = {
    TableName: "dota-qualifier-streams-users",
    ConsistentRead: true
};

function getTwitchUsers(token, twitchUserIds, twitchLoginNames) {
    //Ensure that twitchUserIds and twitchLoginNames are arrays. (Empty arrays if undefined)
    twitchUserIds = typeof twitchUserIds === "string" ? [twitchUserIds] : twitchUserIds || [];
    twitchLoginNames = typeof twitchLoginNames === "string" ? [twitchLoginNames] : twitchLoginNames || [];

    return fetch("https://api.twitch.tv/helix/users?" + qs.stringify({
        id: twitchUserIds,
        login: twitchLoginNames
    }), {
        headers: {
            "Authorization": token
        }
    }).then(response => response.json()).then(twitchResponse => {
        if (twitchResponse.error) {
            throw twitchResponse.error;
        }

        return twitchResponse.data;
    });
}

//User object definition
const buildUserObject = (twitchUserId, displayName, profileImageUrl, role) => ({
    twitchUserId,
    displayName,
    profileImageUrl,
    role
});

module.exports = {
    getOneByToken: token => getTwitchUsers(token).then(twitchUsers => {
        const twitchUser = twitchUsers[0];

        return Promise.all([
            twitchUser,
            dynamoDb.getItemAsync(Object.assign({}, dynamoDbCommonParams, {
                Key: {
                    "twitchUserId": {
                        "N": twitchUser.id
                    }
                }
            }))
        ]);
    }).then(([twitchUser, dynamoDbData]) => {
        if (!dynamoDbData.Item) {
            throw {
                message: `Could not find twitch user with id "${twitchUser.id}" in DynamoDB users table.`
            };
        }

        return buildUserObject(
            dynamoDbData.Item.twitchUserId.N,
            twitchUser.display_name,
            twitchUser.profile_image_url,
            dynamoDbData.Item.role.S
        );
    }),

    getAll: token => dynamoDb.scanAsync(dynamoDbCommonParams).then(data => {
        let users = [];
        for (const item of data.Items) {
            users.push(buildUserObject(
                item.twitchUserId.N,
                null,
                null,
                item.role.S
            ));
        }

        return Promise.all([
            users,
            getTwitchUsers(token, users.map(user => user.twitchUserId))
        ]);
    }).then(([ users, twitchUsers ]) => {
        for (let user of users) {
            const twitchUser = twitchUsers.find(twitchUser => twitchUser.id === user.twitchUserId) || {};
            user.displayName = twitchUser.display_name;
            user.profileImageUrl = twitchUser.profile_image_url;
        }

        return users;
    })
};
