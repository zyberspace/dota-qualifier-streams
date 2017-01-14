import view from "./view";

let streamsIdToIndex = {},
    streams = [];

//Set start values
view.update({
    "connecting": true,
    "connectingType": "Connecting",
    "streams": streams
});

(function createListener() {
    //In case page / tab is not visible, wait till it is
    if (document.hidden) {
        document.addEventListener("visibilitychange", function eventListener() {
            document.removeEventListener("visibilitychange", eventListener);
            createListener();
        });
        return;
    }

    //Initiate EventSource object
    let listener = new EventSource("https://jewel.zyberware.org:3220/");

    listener.onopen = event => {
        console.log("Connected to EventSource stream. readyState === ", listener.readyState);
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
        console.log("Error with EventSource stream. readyState === ", listener.readyState);
        view.update({
            "connecting": true
        });

        if (listener.readyState === 2) { //CLOSED
            //Manually retry after 3 seconds because firefox has problems with this
            listener.close();
            setTimeout(() => createListener(), 3000);
        }
    };

    //Add listeners for the events
    listener.addEventListener("streams-update", event => {
        let updatedStreams = JSON.parse(event.data);
        for (const streamsId in updatedStreams) {
            if (streamsIdToIndex[streamsId] === undefined) {
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
})();
