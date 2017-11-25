const Promise = require("bluebird");
const path = require("path");
const fs = require("fs");
const AWS = require("aws-sdk");
const yaml = require("js-yaml");
const fetch = require("node-fetch");
const buildResponse = require("./src/buildResponse");

const dynamoDb = Promise.promisifyAll(new AWS.DynamoDB());

let serverlessConfig;

module.exports.authorize = (event, context, callback) => {
    if (!serverlessConfig) {
        serverlessConfig = yaml.safeLoad(fs.readFileSync(path.join(__dirname, "serverless.yml")));
    }

    const token = event.authorizationToken;
    fetch("https://api.twitch.tv/helix/users", {
        headers: {
            "Authorization": token
        }
    }).then(response => response.json()).then(twitchResponse => {
        if (twitchResponse.error) {
            console.log(twitchResponse);
            callback("Unauthorized");
            return;
        }

        const twitchUserData = twitchResponse.data[0];
        const twitchUserId = twitchUserData.id;

        return Promise.all([
            twitchUserData,
            twitchUserId,
            dynamoDb.getItemAsync({
                TableName: "dota-qualifier-streams-users",
                Key: {
                    "twitchUserId": {
                        "N": twitchUserId
                    }
                },
                ConsistentRead: true
            })
        ]);
    }).then(([twitchUserData, twitchUserId, dynamoDbData]) => {
        if (!dynamoDbData.Item) {
            callback("Unauthorized");
            return;
        }

        const userData = {
            twitchUserId,
            displayName: twitchUserData.display_name,
            profileImageUrl: twitchUserData.profile_image_url,
            role: dynamoDbData.Item.role.S
        };

        //Generate statements for all allowed methods
        const baseArn = event.methodArn.substr(0, event.methodArn.indexOf("/"));
        const stage = serverlessConfig.provider.stage;
        let statements = [];
        for (const functionName in serverlessConfig.functions) {
            const func = serverlessConfig.functions[functionName];
            if (!func.requireRole) {
                //Skip if requireRole isn't defined
                continue;
            }

            const possibleRoles = typeof func.requireRole === "string" ? [func.requireRole] : func.requireRole;
            if (!possibleRoles.includes(userData.role)) {
                //Skip if the user doesn't have the right role
                continue;
            }

            for (const event of func.events) {
                if (!event.http) {
                    continue;
                }

                statements.push({
                    Action: "execute-api:Invoke",
                    Effect: "Allow",
                    Resource: [
                        baseArn,
                        stage,
                        event.http.method.toUpperCase(),
                        event.http.path
                    ].join("/")
                });
            }
        }

        const response = {
            principalId: twitchUserId,
            policyDocument: {
                Version: "2012-10-17",
                Statement: statements
            },
            context: {
                userData: JSON.stringify(userData)
            }
        };
        callback(null, response);
    });
};

module.exports.login = (event, context, callback) => {
    const authorizerContext = event.requestContext.authorizer;
    const userData = JSON.parse(authorizerContext.userData);

    callback(null, buildResponse({
        userData
    }));
};
