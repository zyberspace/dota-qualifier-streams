import React, { Component } from "react";

import "./SelectedTags.scss";

function generateRemoveLink(tagToRemove, selectedTags) {
    return "#"
        + selectedTags.filter(selectedTag => selectedTag !== tagToRemove)
            .map(tag => encodeURIComponent(tag))
            .join("+");
}

export default ({ selectedTags }) => (
    <div className="selected-tags"><div>
        {selectedTags.map(tag => [
            <a key={tag} href={generateRemoveLink(tag, selectedTags)}>
                {tag}
            </a>,
            " "
        ])}
    </div></div>
);
