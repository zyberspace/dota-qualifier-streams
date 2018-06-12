import React from "react";
import { DragSource } from "react-dnd";
import { FormGroup, Col, ControlLabel, FormControl } from "react-bootstrap";

const StreamEntry = ({ label, value, changed, onChange }) => (
    <FormGroup bsSize="small" validationState={changed  && "warning" || null}>
        <Col componentClass={ControlLabel} xs={3}>
            {label}
        </Col>
        <Col xs={9}>
            <FormControl type="text" value={value || ""} onChange={onChange} />
        </Col>
    </FormGroup>
);

@DragSource(
    "stream",
    {
        beginDrag(props) {
            const { index, stream } = props;

            return {
                index,
                stream
            };
        },
        endDrag(props, monitor, component) {
            if (!monitor.didDrop()) {
                //Only do something if stream was dropped on a target
                return;
            }

            const { index, onMoveStream } = props;
            const { newIndex } = monitor.getDropResult();
            onMoveStream(index, newIndex);
        }
    },
    (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview()
    })
)
class Stream extends React.Component {
    render() {
        const { connectDragPreview, connectDragSource, index, stream, streamLive, onChange, onDelete } = this.props;
        return  connectDragPreview(
            <div className={"stream" + (stream.link ? "" : " new")}>
                {connectDragSource(
                    <div className="link">
                        {stream.link || "New stream"}
                        {streamLive && (
                            <a className="pull-right remove-link" onClick={event => onDelete(index)}>Remove</a>
                        )}
                    </div>
                )}

                <StreamEntry
                    label="Link"
                    value={stream.link}
                    changed={stream.moved || stream.link !== streamLive.link}
                    onChange={event => onChange(index, "link", event.target.value)}
                />
                <StreamEntry
                    label="Casted by"
                    value={stream.castedBy}
                    changed={stream.moved || stream.castedBy !== streamLive.castedBy}
                    onChange={event => onChange(index, "castedBy", event.target.value)}
                />
                <StreamEntry
                    label="Topic"
                    value={stream.topic}
                    changed={stream.moved || stream.topic !== streamLive.topic}
                    onChange={event => onChange(index, "topic", event.target.value)}
                />
                <StreamEntry
                    label="Tags"
                    value={stream.tags}
                    changed={stream.moved || stream.tags !== streamLive.tags}
                    onChange={event => onChange(index, "tags", event.target.value)}
                />
            </div>
        );
    }
}

export default Stream;
