import React from "react";
import { Button, Dropdown, MenuItem, Glyphicon } from "react-bootstrap";
import { logout, getDisplayName, getProfileImageUrl, getRole } from "./Login";
import UsersButton from "../components/UsersButton";

import "./Navigation.scss";

const roleLabels = {
    "admin": "Administrator",
    "moderator": "Moderator"
}

export default () => (
    <nav className="text-right">
        {getRole() === "admin" && (
            <UsersButton />
        )}
        <Dropdown id="user-menu" pullRight>
            <Dropdown.Toggle bsStyle="link">
                <img
                    src={getProfileImageUrl()}
                    role="presentation"
                    className="avatar"
                />
                {getDisplayName()}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <li><span>{roleLabels[getRole()]}</span></li>
                <MenuItem divider />
                <MenuItem onSelect={logout}><span className="text-danger">
                    <Glyphicon glyph="log-out" /> Logout
                </span></MenuItem>
            </Dropdown.Menu>
        </Dropdown>
    </nav>
);
