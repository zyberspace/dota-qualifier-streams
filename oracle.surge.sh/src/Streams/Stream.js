import React from "react";
import StreamLink from "./StreamLink";
import Tag from "./Tag";

import "./Stream.scss";

export default ({ stream }) => (
    <div className="stream">
        <div className="stream-topic">{stream.topic}</div>
        <div className="stream-link">
            <StreamLink castedBy={stream.castedBy} url={stream.link} />
        </div>
        <div className="stream-tags">
            {stream.tags && stream.tags.map(tag => (
                <Tag key={tag}>{tag}</Tag>
            ))}
        </div>
    </div>
)
