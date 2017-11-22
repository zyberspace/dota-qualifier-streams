import React from "react";
import tagTypes from "./tag-types";

import "./Tag.scss";

const tagToTagTypeCache = {};
function getTagType(tag) {
    if (tagToTagTypeCache[tag]) {
        return tagToTagTypeCache[tag];
    }

    for (const tagType in tagTypes) {
        if (tagTypes[tagType].includes(tag)) {
            tagToTagTypeCache[tag] = tagType;
            return tagType;
        }
    }
}

function formatTagType(tagType) {
    if (tagType) {
        return tagType[0].toUpperCase() + tagType.substr(1);
    }
}

function generateLink(tag, selectedTagsTmp) {
    let selectedTags = selectedTagsTmp.slice(0);
    if (!selectedTags.includes(tag)) {
        selectedTags.push(tag);
    }

    return "#" + selectedTags.map(tag => encodeURIComponent(tag)).join("+");
}

export default ({ children, selectedTags }) => {
    const tagType = getTagType(children);
    return (
        <a href={generateLink(children, selectedTags)} className="stream-tag" data-tag-type={tagType}
            title={formatTagType(tagType)}>
            {children}
        </a>
    )
};
