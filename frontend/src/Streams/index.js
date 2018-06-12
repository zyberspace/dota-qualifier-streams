import React, { Component } from "react";
import SelectedTags from "./SelectedTags";
import Stream from "./Stream";

export default class Streams extends Component {
    state = {
        selectedTags: []
    }

    constructor(props) {
        super(props);

        //Load selected tags
        this.updateSelectedTags(true);
        window.addEventListener("hashchange", () => this.updateSelectedTags());
    }

    updateSelectedTags(direct = false) {
        const selectedTags = location.hash.substr(1).split("+")
            .filter(tag => tag.length > 0)
            .map(tag => decodeURIComponent(tag));

        if (direct) {
            this.state.selectedTags = selectedTags;
            return;
        }

        this.setState({
            selectedTags
        });
    }

    render() {
        const { data } = this.props;
        const { selectedTags } = this.state;

        let filteredStreams = data.streams.filter(stream => (
            selectedTags.every(selectedTag => (
                stream.tags.includes(selectedTag)
            ))
        ));

        return [
            (
                <SelectedTags key="selected-tags" selectedTags={selectedTags} />
            ),
            filteredStreams.map(stream => (
                <Stream key={stream.link} stream={stream} selectedTags={selectedTags} />
            ))
        ];
    }
}
