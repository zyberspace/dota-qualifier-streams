import React, { Component } from "react";
import { Button, Modal } from "react-bootstrap";
import UsersModalContent from "./UsersModalContent";

export default class UsersButton extends Component {
    state = {
        showUsersModal: false
    };

    render() {
        const { showUsersModal } = this.state;

        return (
            <span>
                <Button bsStyle="link" onClick={() => this.setState({showUsersModal: true})}>Users</Button>

                <Modal show={showUsersModal} onHide={() => this.setState({showUsersModal: false})}>
                    <UsersModalContent />
                </Modal>
            </span>
        );
    }
}
