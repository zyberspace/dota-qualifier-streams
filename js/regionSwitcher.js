import view from "./view";
import {hooks} from "./listener";

//Register default region and switch function
view.update({
    "regionSelected": "europe",
    "switchRegion": event => {
        event.preventDefault();
        event.target.blur();
        let regionId = event.target.dataset.regionId;
        view.update({
            "regionSelected": regionId
        });

        history.replaceState({}, "", regionId);
    }
});

//Extract regionId from path
let pathRegionId = location.pathname.substr(location.pathname.lastIndexOf("/") + 1);

//Wait for regions from EventSource stream
hooks.onNewRegionId = regionId => {
    if (regionId === pathRegionId) {
        view.update({
            "regionSelected": regionId
        });
    }
};
