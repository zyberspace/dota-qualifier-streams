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

export default ({ children }) => {
    const tagType = getTagType(children);
    return (
        <span className="stream-tag" data-tag-type={tagType} title={formatTagType(tagType)}>
            {children}
        </span>
    )
};
