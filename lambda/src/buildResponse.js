module.exports = (bodyData, statusCode = 200) => ({
    statusCode,
    body: JSON.stringify(bodyData)
});
