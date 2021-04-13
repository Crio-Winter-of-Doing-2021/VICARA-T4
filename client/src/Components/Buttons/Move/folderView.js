import React from "react";
import { useDispatch, useSelector } from "react-redux";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import FolderIcon from "@material-ui/icons/Folder";
// import {typeTest} from '../../Utilities/fileType'
import { Typography } from "@material-ui/core";
import { withRouter } from "react-router-dom";
import { Divider } from "@material-ui/core";

import {
  selectFolderView,
  getFolderPickerView,
  pathAsync,
  selectParent,
} from "../../../store/slices/moveSlice";

function FolderList() {
  let parent_name = useSelector(selectParent);
  let folderView = [];
  folderView = useSelector(selectFolderView);
  let dispatch = useDispatch();

  let resultRenderer = folderView.map((res) => {
    return (
      <ListItem
        style={{ cursor: "pointer" }}
        onClick={() => {
          dispatch(getFolderPickerView(res.id));
          dispatch(pathAsync({ id: res.id, type: "FOLDER" }));
        }}
      >
        <ListItemAvatar>
          <Avatar style={{ backgroundColor: "#3D3333" }}>
            <FolderIcon style={{ color: "#67C5F0" }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={`${res.name}`} />
        <Divider />
      </ListItem>
    );
  });

  return (
    <>
      {resultRenderer.length !== 0 ? (
        resultRenderer
      ) : (
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <Typography style={{ color: "grey", marginTop: "20px" }}>
            Move your selected files/folders in {parent_name}
          </Typography>
        </div>
      )}
    </>
  );
}

export default withRouter(FolderList);
