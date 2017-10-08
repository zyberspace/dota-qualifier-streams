import React from "react";
import ReactDOM from "react-dom";
import DataLoader from "./DataLoader";
import Streams from "./Streams";

ReactDOM.render(
    (
        <DataLoader>
            <Streams />
        </DataLoader>
    ),
    document.getElementById("qualifier-streams")
);
