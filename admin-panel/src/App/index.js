import React from "react";
import { Grid } from "react-bootstrap";
import Login from "./Login";
import Navigation from "./Navigation";
import DataLoader from "../../../oracle.surge.sh/src/DataLoader";
import Streams from "../components/Streams.js";

import "bootstrap/dist/css/bootstrap.css";
import "./App.scss";

const streams = [34, 34, 3];

export default () => (
    <Grid>
        <Login>
            <Navigation />

            <DataLoader>
                <Streams />
            </DataLoader>
        </Login>
    </Grid>
);
