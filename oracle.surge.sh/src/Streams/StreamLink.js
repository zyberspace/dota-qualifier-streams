import React from "react";

function formatUrl(url, forHref = false) {
    const partsToTrim = ["//", "http://", "https://", "www.", "go."];
    let goLink = false;

    for (const partToTrim of partsToTrim) {
        if (url.startsWith(partToTrim)) {
            if (partToTrim === "go.") {
                goLink = true;
            }
            url = url.substr(partToTrim.length);
        }
    }

    if (forHref) {
        url = "https://" + (goLink === true ? "go" : "www") + "." + url;
    }

    return url;
}

export default ({ castedBy, url}) => (
    <a href={formatUrl(url, true)} target="_blank">
        {castedBy && [castedBy, " - "]}
        {formatUrl(url)}
    </a>
);
