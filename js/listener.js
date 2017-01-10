import view from "./view";

let streamsIdToIndex = {},
    streams = [];

//Set start values
view.update({
    "connecting": true,
    "connectingType": "Connecting",
    "streams": streams
});

//Initiate EventSource object
const listener = new EventSource("https://jewel.zyberware.org:3220/");
listener.onopen = event => {
    view.update({
        "connecting": false
    });

    //Wait till the connection bar is hidden before changing the text
    setTimeout(() => {
        view.update({
            "connectingType": "Reconnecting" //Next time we need to connect it's a "reconnect"
        });
    }, 3000);
};
listener.onerror = event => {
    view.update({
        "connecting": true
    });
};

//Add listeners for the events
listener.addEventListener("streams-update", event => {
    let updatedStreams = JSON.parse(event.data);
    for (const streamsId in updatedStreams) {
        if (!streamsIdToIndex[streamsId]) {
            streamsIdToIndex[streamsId] = streams.length;
            streams.push(null);
        }

        //Update array values with splice so rivets recognizes them
        streams.splice(streamsIdToIndex[streamsId], 1, updatedStreams[streamsId]);
    }
});

listener.addEventListener("page-viewers-update", event => {
    view.update({
        "page-viewers": event.data
    });
});
