rivets.formatters.https = function(value) {
    return "https://" + value;
}

var view = rivets.bind(document.getElementsByTagName("body")[0], {
    "connecting": true,
    "connectingType": "Connecting"
});

var listener = new EventSource("https://jewel.zyberware.org:3220/");
listener.onopen = function(event) {
    view.update({
        "connecting": false
    });

    //Wait till the connection bar is hidden before changing the text
    setTimeout(function() {
        view.update({
            "connectingType": "Reconnecting" //Next time we need to connect it's a "reconnect"
        });
    }, 3000);
};
listener.onerror = function(event) {
    view.update({
        "connecting": true
    });
};

listener.addEventListener("streams-update", function(event) {
    view.update({
        "streams": JSON.parse(event.data)
    });
});

listener.addEventListener("page-viewers-update", function(event) {
    view.update({
        "page-viewers": event.data
    });
});
