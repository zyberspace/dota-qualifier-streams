import React from "react";
import Stream from "./Stream";

export default ({ data }) => data.streams.map(stream => (
    <Stream key={stream.link} stream={stream} />
));
