import Promise from "bluebird";
import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";
import { apiEndpoint } from "../../../config.yaml";
import { getToken } from "../../App/Login";
import UsersList from "./UsersList";
import AddUser from "./AddUser";

const usersApiUrl = apiEndpoint + "/users";

export default class UsersModalContent extends Component {
    state = {
        users: false,
        saving: false
    };

    constructor(props) {
        super(props);

        //Bind methods used in render
        this.getUsers = this.getUsers.bind(this);
        this.updateUserRole = this.updateUserRole.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
        this.deleteUser = this.deleteUser.bind(this);

        //Get users
        this.getUsers();
    }

    getUsers() {
        fetch(usersApiUrl, {
            headers: {
                "Authorization": getToken()
            }
        }).then(response => response.json()).then(({users}) => {
            for (let user of users) {
                user.savedRole = user.role;
            }

            this.setState({
                users
            })
        });
    }

    updateUserRole(userIndex, role) {
        let users = JSON.parse(JSON.stringify(this.state.users));

        users[userIndex]["role"] = role;

        this.setState({
            users
        });
    }

    saveChanges() {
        this.setState({
            "saving": true
        });

        Promise.map(this.state.users, user => {
            if (user.savedRole !== user.role) {
                return fetch(usersApiUrl, {
                    method: "post",
                    headers: {
                        "Authorization": getToken()
                    },
                    body: JSON.stringify({
                        twitchUserId: user.twitchUserId,
                        role: user.role
                    })
                }).then(response => response.json());
            }

            return "nochange";
        }).then(responses => {
            console.log(responses);
            this.setState({
                "saving": false
            });

            this.getUsers();
        });
    }


    deleteUser(userIndex) {
        const { twitchUserId } = this.state.users[userIndex];

        this.setState({
            "saving": true
        });

        fetch(usersApiUrl, {
            method: "delete",
            headers: {
                "Authorization": getToken()
            },
            body: JSON.stringify({
                twitchUserId
            })
        }).then(response => response.json()).then(response => {
            console.log(response);
            this.setState({
                "saving": false
            });

            this.getUsers();
        });
    }

    render() {
        const { users, saving } = this.state;

        return (
            <div>
                <Modal.Header closeButton>
                    <Modal.Title>Users</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {users === false && (
                        "Loading..."
                    )}
                    {users !== false && (
                        <UsersList users={users} onUserRoleChange={this.updateUserRole}
                            onUserDelete={this.deleteUser} />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <div className="pull-left">
                        <AddUser onAdd={this.getUsers} />
                    </div>

                    <Button disabled={saving} onClick={this.saveChanges}>
                        {saving === false ? "Save changes" : "Saving..."}
                    </Button>
                </Modal.Footer>
            </div>
        );
    }
}
