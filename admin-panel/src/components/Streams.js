import React, { Component } from "react";
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import { Form, ButtonGroup, Button } from "react-bootstrap";
import { apiEndpoint } from "../../config.yaml";
import { getToken } from "../App/Login";
import DropSplitter from "./DropSplitter";
import Stream from "./Stream";

import "./Streams.scss";

const updateStreamsApiUrl = apiEndpoint + "/update-streams";

@DragDropContext(HTML5Backend)
class Streams extends Component {
    state = {
        "saving": false
    };

    transformStreamsForForm(originalStreams) {
        const streams = JSON.parse(JSON.stringify(originalStreams));
        for (const stream of streams) {
            if (stream.tags) {
                stream.tags = stream.tags.join(", ");
            }
        }
        streams.push({});

        return streams;
    }

    constructor(props) {
        super(props);

        //Init streams
        this.state.streams = this.state.streamsLive = this.transformStreamsForForm(props.data.streams);
        this.state.streamsLiveUnmoved = this.state.streamsLive //We save the unmoved stream list for the reset button

        //Bind methods used in render
        this.deleteStream = this.deleteStream.bind(this);
        this.moveStream = this.moveStream.bind(this);
        this.updateStreamProperty = this.updateStreamProperty.bind(this);
        this.updateStreams = this.updateStreams.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        const streams = this.transformStreamsForForm(nextProps.data.streams);

        this.setState({
            streams,
            streamsLive: streams,
            streamsLiveUnmoved: streams //We save the unmoved stream list for the reset button
        });
    }

    deleteStream(streamIndex) {
        const streams = JSON.parse(JSON.stringify(this.state.streams));

        //Will get filtered out when saving the streams
        streams[streamIndex].removed = true;

        this.setState({
            streams
        });
    }

    moveStream(oldStreamIndex, newStreamIndex) {
        if (newStreamIndex === oldStreamIndex || newStreamIndex === oldStreamIndex + 1) {
            //If the old and new stream index are the same or the stream should be moved  behind itself,
            //do nothing.
            return;
        }

        const streams = JSON.parse(JSON.stringify(this.state.streams));
        const streamsLive = JSON.parse(JSON.stringify(this.state.streamsLive));

        console.log(oldStreamIndex, newStreamIndex);

        if (newStreamIndex > oldStreamIndex) {
            //Remove new index by one because we are gonna delete the element first
            newStreamIndex--;
        }

        streams.splice(newStreamIndex, 0, streams.splice(oldStreamIndex, 1)[0]);
        streamsLive.splice(newStreamIndex, 0, streamsLive.splice(oldStreamIndex, 1)[0]);

        streams[newStreamIndex].moved = true;

        this.setState({
            streams,
            streamsLive
        });
    }

    updateStreamProperty(streamIndex, propertyKey, propertyValue) {
        const streams = JSON.parse(JSON.stringify(this.state.streams));

        if (propertyValue.length > 0) {
            streams[streamIndex][propertyKey] = propertyValue;
        } else {
            delete streams[streamIndex][propertyKey];
        }

        this.setState({
            streams
        });
    }

    updateStreams(event) {
        event.preventDefault();
        this.setState({
            "saving": true
        });

        let streams = JSON.parse(JSON.stringify(this.state.streams));

        //Filter out removed streams
        streams = streams.filter(stream => !stream.removed);

        //Split tags into an array and remove "moved" flag
        for (const stream of streams) {
            if (stream.tags) {
                stream.tags = stream.tags.split(",").map(value => value.trim());
            }

            delete stream.moved;
        }

        //Update streams
        fetch(updateStreamsApiUrl, {
            method: "post",
            headers: {
                "Authorization": getToken()
            },
            body: JSON.stringify(streams)
        }).then(response => response.json()).then(response => {
            this.setState({
                "saving": false
            });
            console.log(response);
        });
    }

    render() {
        const { streams, streamsLive, saving } = this.state;

        return (
            <Form
                horizontal
                onReset={() => this.setState({
                    streams: this.state.streamsLiveUnmoved,
                    streamsLive: this.state.streamsLiveUnmoved
                })}
                onSubmit={this.updateStreams}
            >
                <div className="streams">
                    {streams.map((stream, index) => (
                        <DropSplitter key={streamsLive[index].link || "new"} index={index}>
                            {stream.removed && (
                                <div className="stream bg-warning text-warning">
                                    <del>{stream.link}</del>
                                </div>
                            )}

                            {!stream.removed && (
                                <Stream index={index} stream={stream} streamLive={streamsLive[index]}
                                    onChange={this.updateStreamProperty} onDelete={this.deleteStream}
                                    onMoveStream={this.moveStream} />
                            )}
                        </DropSplitter>
                    ))}
                </div>

                <div className="text-right">
                    {saving !== true && (
                        <ButtonGroup>
                            <Button type="reset">Reset</Button>
                            <Button type="submit">Save changes</Button>
                        </ButtonGroup>
                    )}
                    {saving === true && (
                        <Button disabled>Saving...</Button>
                    )}
                </div>
            </Form>
        );
    }
}

export default Streams;
