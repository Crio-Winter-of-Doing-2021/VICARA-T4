import React from "react";

import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import FolderIcon from "@material-ui/icons/Folder";
import { typeTest } from "../../Utilities/fileType";
import { withRouter } from "react-router-dom";
import { Divider } from "@material-ui/core";

function SearchResults({ result, ...props }) {
  let resultRenderer = result.map((res) => {
    return (
      <ListItem
        style={{ cursor: "pointer" }}
        onClick={() => {
          if (res.type === "folder") {
            props.history.push(`/drive/${res.id}`);
            props.viewPopper(false);
          } else {
            props.history.push(`/drive/${res.parent}`);
            props.viewPopper(false);
          }
        }}
      >
        <ListItemAvatar>
          <Avatar style={{ backgroundColor: "#3D3333" }}>
            {res.type === "folder" ? (
              <FolderIcon style={{ color: "#67C5F0" }} />
            ) : (
              typeTest(res.name)
            )}
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={res.name} secondary={res.owner.username} />
        <Divider />
      </ListItem>
    );
  });

  return <>{resultRenderer}</>;
}

export default withRouter(SearchResults);
