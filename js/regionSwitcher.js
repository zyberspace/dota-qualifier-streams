import view from "./view";
import {hooks} from "./listener";

let regionSelected = false;

function selectRegion(regionId) {
    regionSelected = regionId;
    view.update({
        "regionSelected": regionSelected
    });

    history.replaceState({}, "", regionId);
}

function findRegionById(regionId) {
    return region => region.id === regionId;
}

//Register switch function and set regionSelected to false till we got the regions from the server
view.update({
    "regionSelected": regionSelected,
    "switchRegion": event => {
        event.preventDefault();
        event.target.blur();
        selectRegion(event.target.dataset.regionId);
    }
});

//This gets called every time there is a "streams-update" event
hooks.onStreamsUpdate = regions => {
    //Check if the currently selected region still exists
    if (regionSelected !== false && regions.find(findRegionById(regionSelected)) === undefined) {
        regionSelected = false;
    }

    if (regionSelected === false) {
        //Extract regionId from path
        let pathRegionId = location.pathname.substr(location.pathname.lastIndexOf("/") + 1);

        //Check if we have a region for this
        let pathRegion = regions.find(findRegionById(pathRegionId));

        //If we found one, select it
        if (pathRegion) {
            selectRegion(pathRegion.id);
            return;
        }

        //Otherwise select the first region
        selectRegion(regions[0].id);
    }
};
