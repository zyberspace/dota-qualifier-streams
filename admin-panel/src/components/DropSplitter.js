import React from "react";
import { DropTarget } from "react-dnd";

@DropTarget(
    "stream",
    {
        drop(props, monitor, component) {
            const { index, half } = props;

            let newIndex = index;

            if (half === "bottom") {
                //Stream will be inserted behind us
                newIndex++;
            }

            return {
                newIndex
            };
        }
    },
    (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        canDrop: monitor.canDrop(), //Will be false if nothing gets dragged,
        isOver: monitor.isOver()
    })
)
class DropTargetHalf extends React.Component {
    render() {
        const { connectDropTarget, canDrop, isOver, half } = this.props;

        if (canDrop === false) {
            return null;
        }

        const top = half === "top";
        const bottom = half === "bottom";

        return connectDropTarget(
            <div style={{
                position: "absolute",
                top: top && "-1px",
                bottom: bottom && "0px",
                left: "0px",
                width: "100%",
                height: "50%",
                borderTop: top && isOver && "1px solid black",
                borderBottom: bottom && isOver && "1px solid black"
            }} />
        );
    }
}

export default class DropSplitter extends React.Component {
    render() {
        const { children, index } = this.props;

        return (
            <div style={{position: "relative"}}>
                {children}

                <DropTargetHalf index={index} half="top" />
                <DropTargetHalf index={index} half="bottom" />
            </div>
        );
    }
};
