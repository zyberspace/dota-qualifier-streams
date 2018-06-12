import React from "react";
import { Table, Dropdown, MenuItem, OverlayTrigger, Popover, Button, Glyphicon } from "react-bootstrap";

const availableRoles = [
  "admin",
  "moderator"
];

export default ({ users, onUserRoleChange, onUserDelete }) => [
    <div className="alert alert-info">
        <p>Admins can add and delete users and change their role.</p>
        <p>Moderators can only edit streams.</p>
    </div>,
    <Table condensed hover>
        <thead>
            <tr>
                <th width="100">Twitch id</th>
                <th>Twitch name</th>
                <th width="100">Role</th>
                <th width="25"></th>
            </tr>
        </thead>
        <tbody>
            {users.map(({ twitchUserId, displayName, profileImageUrl, role}, userIndex) => (
                <tr key={twitchUserId}>
                    <td>{twitchUserId}</td>
                    <td>
                        <img
                            src={profileImageUrl}
                            role="presentation"
                            className="avatar"
                        />
                        {displayName}
                    </td>
                    <td>
                        <Dropdown id={twitchUserId + "-role-menu"} bsSize="xs" className="btn-block">
                            <Dropdown.Toggle block>
                                {role}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {availableRoles.map(availableRole => (
                                    <MenuItem key={availableRole}
                                        onSelect={() => onUserRoleChange(userIndex, availableRole)}>
                                        {availableRole}
                                    </MenuItem>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </td>
                    <td>
                        <OverlayTrigger trigger="click" rootClose placement="left" overlay={(
                            <Popover id={twitchUserId + "-popover"}>
                                <Button bsStyle="danger" block onClick={() => onUserDelete(userIndex)}>
                                    Delete user
                                </Button>
                            </Popover>
                        )}>
                            <a className="text-danger" style={{cursor: "pointer"}} title="Delete user">
                                <Glyphicon glyph="remove" style={{lineHeight: "inherit"}} />
                            </a>
                        </OverlayTrigger>
                    </td>
                </tr>
            ))}
        </tbody>
  </Table>
];
