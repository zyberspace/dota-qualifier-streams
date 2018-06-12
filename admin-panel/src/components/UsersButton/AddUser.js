import Promise from "bluebird";
import React, { Component } from "react";
import qs from "qs";
import { InputGroup, FormControl, Button } from "react-bootstrap";
import { apiEndpoint } from "../../../config.yaml";
import { getToken } from "../../App/Login";

const usersApiUrl = apiEndpoint + "/users";
const newUserRole = "moderator";

export default class AddUser extends Component {
    state = {
        "username": "",
        "status": "ready"
    };

    constructor(props) {
        super(props);

        //Bind methods used in render
        this.addUser = this.addUser.bind(this);
    }

    addUser(event) {
        event.preventDefault();

        const username = this.state.username.trim();
        if (username.length === 0) {
            return;
        }

        this.setState({
            "username": "",
            "status": "Searching for user..."
        });

        fetch("https://api.twitch.tv/helix/users?" + qs.stringify({
            login: username
        }), {
            headers: {
                "Authorization": getToken()
            }
        }).then(response => response.json()).then(response => {
            if (response.error) {
                throw {
                    message: [response.error, response.message].filter(value => value.length > 0).join("\n"),
                    response
                }
            }

            if (response.data === null || response.data.length === 0) {
                throw {
                    message: "There is no twitch user with this name.",
                    response
                };
            }

            const twitchUserId = response.data[0].id;

            this.setState({
                "status": "Adding user..."
            });

            return fetch(usersApiUrl, {
                method: "post",
                headers: {
                    "Authorization": getToken()
                },
                body: JSON.stringify({
                    twitchUserId,
                    role: newUserRole
                })
            }).then(response => response.json());
        }).then(response => {
            if (response.error) {
                throw error;
            }

            console.log(response);

            this.props.onAdd();
            return;
        }).catch(error => {
            console.log(error);
            alert(error.message);
        }).then(() => this.setState({
            status: "ready"
        }));
    }

    render() {
        const { username, status } = this.state;

        return (
            <form onSubmit={this.addUser}>
                <InputGroup>
                    <FormControl type="text" placeholder="Twitch name" value={username} style={{width: "120px"}}
                        onChange={event => this.setState({username: event.target.value})} />
                    <InputGroup.Button>
                        <Button type="submit" disabled={status !== "ready"}>
                            {status !== "ready" ? status : "Add user"}
                        </Button>
                    </InputGroup.Button>
                </InputGroup>
            </form>
        );
    }
}
