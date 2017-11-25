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

//Define available roles
const availableRoles = [
    "admin",
    "moderator"
];

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
    }),

    updateOne: (token, { twitchUserId, role }) => Promise.try(() => {
        if (typeof twitchUserId !== "string" || typeof role !== "string") {
            throw {
                message: "`twitchUserId` and `role` need to be defined and be a string!",
                twitchUserId,
                role
            };
        }

        if (!availableRoles.includes(role)) {
            throw {
                message: "Unknown role!",
                role,
                availableRoles
            };
        }

        //Check if twitch user exists
        return getTwitchUsers(token, twitchUserId);
    }).then(twitchUsers => {
        if (twitchUsers.length === 0) {
            throw {
                message: `Twitch user with id ${twitchUserId} doesn't exist!`,
                twitchUserId
            };
        }

        const params = Object.assign({}, dynamoDbCommonParams, {
            Item: {
                "twitchUserId": {
                    "N": twitchUserId
                },
                "role": {
                    "S": role
                }
            }
        });
        delete params.ConsistentRead; //Not an available param for putItem

        return dynamoDb.putItemAsync(params).catch(error => {
            //AWS has it's error in the cause property
            throw error.cause;
        });
    }),

    deleteOne: ({ twitchUserId }) => Promise.try(() => {
        if (typeof twitchUserId !== "string") {
            throw {
                message: "`twitchUserId` needs to be defined and be a string!",
                twitchUserId
            };
        }

        const params = Object.assign({}, dynamoDbCommonParams, {
            Key: {
                "twitchUserId": {
                    "N": twitchUserId
                }
            }
        });
        delete params.ConsistentRead; //Not an available param for deleteItem

        return dynamoDb.deleteItemAsync(params).catch(error => {
            //AWS has it's error in the cause property
            throw error.cause;
        });
    })
};
