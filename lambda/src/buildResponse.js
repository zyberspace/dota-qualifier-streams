module.exports = (bodyData, statusCode = 200) => ({
    statusCode,
    headers: {
        "Access-Control-Allow-Origin" : "*"
    },
    body: JSON.stringify(bodyData)
});
