import React from "react";
import { useDispatch } from "react-redux";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
// import Typography from '@material-ui/core/Typography';
import ListItemIcon from "@material-ui/core/ListItemIcon";
// import EditIcon from "@material-ui/icons/Edit";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";

import { ListItemText } from "@material-ui/core";

import { downloadAsync } from "../../store/slices/loaderSlice";

import Share from "../Share/index";

const initialState = {
  mouseX: null,
  mouseY: null,
};

export default function ContextMenu(props) {
  const [state, setState] = React.useState(initialState);

  const dispatch = useDispatch();

  const handleClick = (event) => {
    event.preventDefault();
    setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleClose = () => {
    setState(initialState);
  };

  return (
    <div onContextMenu={handleClick}>
      {props.children}
      <Menu
        keepMounted
        open={state.mouseY !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          state.mouseY !== null && state.mouseX !== null
            ? { top: state.mouseY, left: state.mouseX }
            : undefined
        }
      >
        <Share data={props.data} menuClose={handleClose} />
        <MenuItem
          onClick={() => {
            handleClose();
            dispatch(downloadAsync(props.data));
          }}
        >
          <ListItemIcon>
            <CloudDownloadIcon color="secondary" />
          </ListItemIcon>
          <ListItemText style={{ paddingRight: "15px" }}>Download</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            dispatch(downloadAsync(props.data));
          }}
        >
          <ListItemIcon>
            <CloudDownloadIcon color="secondary" />
          </ListItemIcon>
          <ListItemText style={{ paddingRight: "15px" }}>Update</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
}
