import view from "./view";
import { regions } from "./listener";
import { selectRegion } from "./regionSwitcher";

const storageKey = "obs-settings";
const settings = JSON.parse(localStorage.getItem(storageKey)) || {
    switchRegions: false,
    switchInterval: 5,
    switchRegionsBy: "streams",
    switchRegionsList: "",

    hidePageViewers: false
};

let switchRegionInterval;
function switchRegion() {
    const regionSelected = view.models.regionSelected;

    let availableRegionIds = [];
    switch (settings.switchRegionsBy) {
        case "streams":
            availableRegionIds = [];
            for (const region of regions) {
                if (region.streams.length > 0) {
                    availableRegionIds.push(region.id);
                }
            }
            break;
        case "list":
            availableRegionIds = settings.switchRegionsList.split(",").map(value => value.trim())
                .filter(unsafeRegionId => {
                    //Check if the region id typed in by the user actually exists
                    return regions.find(region => region.id == unsafeRegionId)
                });
    }

    if (availableRegionIds.length === 0) {
        return;
    }

    let nextIndex = availableRegionIds.indexOf(regionSelected) + 1;
    if (nextIndex === availableRegionIds.length) {
        nextIndex = 0;
    }

    selectRegion(availableRegionIds[nextIndex]);
}

function updateObsSettings() {
    localStorage.setItem(storageKey, JSON.stringify(settings));

    clearInterval(switchRegionInterval);
    if (settings.switchRegions === true) {
        switchRegionInterval = setInterval(switchRegion, settings.switchInterval * 1000);
    }
}

view.update({
    showObsMenu: false,
    updateObsSettings,
    obsSettings: settings
});

updateObsSettings();

export const menuHotkey = {
    requiredKeys: ["o", "b", "s"],
    call() {
        view.update({
            showObsMenu: !view.models.showObsMenu
        });
    }
};
