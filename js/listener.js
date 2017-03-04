import view from "./view";

let failedServers = [];
let regions = [];
export let hooks = {
    onStreamsUpdate: null
};

//Set start values
view.update({
    "connecting": true,
    "connectingType": "Connecting",
    "regions": regions
});

connectToEventServer();

function connectToEventServer(failedServer) {
    if (failedServer) {
        console.log("Server failed:", failedServer);
        failedServers.push(failedServer);
    }

    //In case page / tab is not visible, wait till it is
    if (document.hidden) {
        document.addEventListener("visibilitychange", function eventListener() {
            document.removeEventListener("visibilitychange", eventListener);
            connectToEventServer();
        });
        return;
    }

    getServers((servers) => {
        let nonFailedServers = servers.filter(server => {
            return !failedServers.includes(server);
        });

        if (nonFailedServers.length === 0) {
            //No non failed servers left, let's reset and try again
            failedServers.splice(0);
            nonFailedServers = servers;
        }

        //Connect to a random non failed server
        createListener(nonFailedServers[Math.floor(Math.random() * nonFailedServers.length)]);
    });
};

function getServers(callback) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function() {
        callback(JSON.parse(this.responseText));
    });
    oReq.open("GET", "https://s3.eu-central-1.amazonaws.com/oracle-hub/server-list.json");
    oReq.send();
}

function createListener(server) {
    //Initiate EventSource object
    let listener = new EventSource(server);

    //Try another server if we can't get a connection after 5 seconds
    let connectionTimeout = setTimeout(() => {
        listener.close();
        connectToEventServer(server);
    }, 5000);

    listener.onopen = event => {
        console.log("Connected to EventSource stream. readyState === ", listener.readyState);
        clearTimeout(connectionTimeout);

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
        clearTimeout(connectionTimeout);

        view.update({
            "connecting": true
        });

        if (listener.readyState === 2) { //CLOSED
            //Manually retry after 3 seconds because firefox has problems with this
            listener.close();
            setTimeout(() => connectToEventServer(server), 3000);
        }
    };

    //Add listeners for the events
    listener.addEventListener("streams-update", event => {
        let updatedRegions = JSON.parse(event.data);
        for (const regionId in updatedRegions) {
            let updatedRegion = updatedRegions[regionId];

            //Check if we already have a region with this id
            let regionIndex = regions.findIndex(region => {
                return region.id === regionId;
            });
            if (regionIndex < 0) {
                regionIndex = regions.length;
                regions.push(null);
            }

            //Remove region if it is null
            if (updatedRegion === null) {
                regions.splice(regionIndex, 1);
                continue;
            }

            //Add id to region object
            updatedRegion.id = regionId;

            //Update region
            regions[regionIndex] = updatedRegion;
        }

        //Make sure regions are sorted correctly (also makes rivets recognize the changes)
        regions.sort((a, b) => {
            return a.orderId - b.orderId;
        });

        if (typeof hooks.onStreamsUpdate === "function") {
            hooks.onStreamsUpdate(regions);
        }
    });

    listener.addEventListener("page-viewers-update", event => {
        view.update({
            "page-viewers": event.data
        });
    });
}
