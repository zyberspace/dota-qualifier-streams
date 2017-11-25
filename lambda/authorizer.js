const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const users = require("./src/users");
const buildResponse = require("./src/buildResponse");

let serverlessConfig;

module.exports.authorize = (event, context, callback) => {
    if (!serverlessConfig) {
        serverlessConfig = yaml.safeLoad(fs.readFileSync(path.join(__dirname, "serverless.yml")));
    }

    users.getOneByToken(event.authorizationToken).then(user => {
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
            if (!possibleRoles.includes(user.role)) {
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
            principalId: user.twitchUserId,
            policyDocument: {
                Version: "2012-10-17",
                Statement: statements
            },
            context: {
                userData: JSON.stringify(user)
            }
        };
        callback(null, response);
    }).catch(error => {
        console.log(error);
        callback("Unauthorized");
    });
};

module.exports.login = (event, context, callback) => {
    const authorizerContext = event.requestContext.authorizer;
    const userData = JSON.parse(authorizerContext.userData);

    callback(null, buildResponse({
        userData
    }));
};
