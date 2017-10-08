import React from "react";
import { device } from "aws-iot-device-sdk";
import mergePatch from "./mergePatch";
import config from "./config.yaml";

const { dataUrl, dataFile } = config;

export default class DataLoader extends React.Component {
    state = {};

    constructor(props) {
        super(props);

        this.updateData();
        this.subscribeToUpdates();
    }

    updateData() {
        fetch(dataUrl + dataFile).then(response => response.json()).then(data => {
            this.setState({
                data
            })
        });
    }

    subscribeToUpdates() {
        const { region, accessKey, secretKey, iotEndpoint, topicPrefix } = config.iot;
        const iotClient = device({
            protocol: 'wss',
            host: iotEndpoint,
            region: region,
            accessKeyId: accessKey,
            secretKey: secretKey
        });

        iotClient.on("connect", () => {
            console.log("iot connected");
            iotClient.subscribe(topicPrefix + dataFile);
        });

        iotClient.on("error", error => {
            console.log("iot websocket error", error);
        });

        iotClient.on("message", (topic, payload) => {
            if (!this.state.data) {
                return;
            }

            const patch = JSON.parse(payload.toString());

            const oldVersion = this.state.data._version;
            const newVersion = patch._version;
            if (newVersion !== oldVersion + 1) {
                console.log(`iot update: Versions don't match (${oldVersion} -> ${newVersion}),`
                    + " doing a complete update...");
                this.updateData();
                return;
            }

            const data = {
                ...this.state.data
            };
            mergePatch(data, patch);
            this.setState({
                data
            })
        });

        iotClient.on("close", () => {
            console.log("iot closed")
        });
    }

    render() {
        if (!this.state.data) {
            return "Loading...."
        }

        return React.cloneElement(this.props.children, this.state);
    }
}
