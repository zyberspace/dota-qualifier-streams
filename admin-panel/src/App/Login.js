import React, { Component } from "react";
import Promise from "bluebird";
import qs from "qs";
import { apiEndpoint, twitchClientId, twitchRedirectUri } from "../../config.yaml";

import LoginButton from "./LoginButton";

const loginApiUrl = apiEndpoint + "/login";

let userData;

export const setToken = token => localStorage.token = token;
export const getToken = () => localStorage.token;
export const deleteToken = () => delete localStorage.token;
export const logout = () => {
    //Revoke twitch token first
    fetch("https://api.twitch.tv/kraken/oauth2/revoke?" + qs.stringify({
        "client_id": twitchClientId,
        "token": getToken().split(" ", 2)[1]
    }), {method: "POST"}).catch(() => { //We use catch because twitch doesn't provide a cors header
        //Delete saved token
        deleteToken();

        //Reload page
        location.href = "";
    });
};
export const getDisplayName = () => userData.displayName;
export const getProfileImageUrl = () => userData.profileImageUrl;
export const getRole = () => userData.role;

export default class Login extends Component {
    state = {
        status: null
    }

    constructor(props) {
        super(props);

        const parameters = this.parameters = qs.parse(location.hash.substr(1));

        if (parameters["access_token"]) {
            setToken("Bearer " + parameters["access_token"]);

            //Reload side without hash
            location.replace("");
            return;
        }

        if (parameters["error"]) {
            this.state.status = "error";
            return;
        }

        const token = getToken();
        if (!token) {
            this.state.status = "loggedOut";
            return;
        }

        this.state.status = "Checking token...";
        fetch(loginApiUrl, {
            headers: {
                "Authorization": token
            }
        }).then(response => Promise.all([
            response.ok,
            response.status,
            response.json()
        ])).then(([responseOk, responseStatus, response]) => {
            if (responseOk !== true) {
                switch (responseStatus) {
                    case 401:
                        this.setState({
                            status: "You are not authorized to access the admin panel."
                                + " Reload the page to try again or use a different twitch account."
                        });
                        break;
                    default:
                        throw {
                            message: "Unknow error, response status code was " + responseStatus,
                            responseOk,
                            responseStatus,
                            response
                        };
                        break;
                }

                deleteToken();
                return;
            }

            userData = response.userData;
            this.setState({
                status: "loggedIn"
            });
        }).catch(e => {
            console.log(e, sessionStorage);
            deleteToken();
            this.setState({
                status: "Error while checking token! Try reloading the page."
            });
        });
    }

    getLoginUrl() {
        return "https://api.twitch.tv/kraken/oauth2/authorize?" + qs.stringify({
            "response_type": "token",
            "client_id": twitchClientId,
            "redirect_uri": twitchRedirectUri,
            "force_verify": "true"
        });
    }

    render() {
        const { status } = this.state;

        switch (status) {
            case "loggedIn":
                return this.props.children;
                break;
            case "loggedOut":
                return (
                    <LoginButton loginUrl={this.getLoginUrl()} />
                );
            case "error":
                return (
                    <pre className="bg-danger text-danger">
                        <code>
                            {JSON.stringify(this.parameters, null, 2)}
                        </code>
                    </pre>
                );
                break;
            default:
                return status;
        }
    }
}
