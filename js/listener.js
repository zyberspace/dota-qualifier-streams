import view from "./view";

let regions = [];

//Set start values
view.update({
    "connecting": true,
    "connectingType": "Connecting",
    "regions": regions
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
        let updatedRegions = JSON.parse(event.data);
        for (const regionId in updatedRegions) {
            let updatedRegion = updatedRegions[regionId];
            //Add id to region object
            updatedRegion.id = regionId;

            //Check if we already have a region with this id
            let regionIndex = regions.findIndex(region => {
                return region.id === updatedRegion.id;
            });
            if (regionIndex < 0) {
                regionIndex = regions.length;
                regions.push(null);
            }

            //Update array values with splice so rivets recognizes them
            regions.splice(regionIndex, 1, updatedRegion);
        }
    });

    listener.addEventListener("page-viewers-update", event => {
        view.update({
            "page-viewers": event.data
        });
    });
})();
