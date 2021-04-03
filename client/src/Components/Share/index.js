import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import ShareIcon from "@material-ui/icons/Share";
import CopyLink from "./copyClipboard";
import UserSearchField from "./users";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";

import {
  Divider,
  ListItem,
  ListItemText,
  MenuItem,
  ListItemIcon,
  Typography,
  Avatar,
  Chip,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";

import {
  setPatchUsersDefault,
  selectPatchUsers,
  updatePatchUsers,
  sharePatchAsync,
} from "../../store/slices/shareSlice";
import {
  privacyAsync,
} from "../../store/slices/structureSlice";
import {
  privacyAsync as recentPrivacyAsync,
} from "../../store/slices/recentSlice";
import {
  privacyAsync as favPrivacyAsync,
} from "../../store/slices/favSlice";

import {selectPage} from '../../store/slices/loaderSlice'

export default function FormDialog(props) {
  const [open, setOpen] = React.useState(false);

  const dispatch = useDispatch();

  let page=useSelector(selectPage)

  let patchUsers = [];
  patchUsers = useSelector(selectPatchUsers);

  const handleDelete = (e, user) => {
    e.preventDefault();
    dispatch(updatePatchUsers(user));
  };

  let patchUsersRenderer = patchUsers.map((user) => {
    return (
      <Chip
        style={{ margin: "2px" }}
        icon={
          <Avatar
            style={{ width: "20px", height: "20px" }}
            alt={user.username}
            src={user.profile_picture_url}
          />
        }
        label={user.username}
        onDelete={(e) => handleDelete(e, user)}
        color="primary"
      />
    );
  });

  const handleClose = () => {
    setOpen(false);
  };

  let privReverse = {
    payload: {
      id: props.data.id,
      privacy: !props.data.privacy,
    },
    type: props.data.type,
    key: props.index,
  };

  let k = 0;
  let new_patch_data = [];

  console.log(patchUsers);

  for (k = 0; k < patchUsers.length; k++) {
    new_patch_data.push(patchUsers[k].id);
  }

  let patchData = {
    payload: {
      id: props.data.id,
      shared_among: new_patch_data,
    },
    type: props.data.type,
    index: props.index,
    updateData:{
      index: props.index,
      users: patchUsers,
    },
    page:page
  };

  return (
    <div>
      <MenuItem
        onClick={() => {
          props.menuClose();
          setOpen(true);
          dispatch(setPatchUsersDefault(props.data.shared_among));
        }}
      >
        <ListItemIcon>
          <ShareIcon color="primary" />
        </ListItemIcon>
        <ListItemText>Share</ListItemText>
      </MenuItem>
      <Dialog
        fullWidth
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <div
          id="form-dialog-title"
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "15px 15px 10px",
          }}
        >
          <div>
            <Typography variant="h6">Share with users</Typography>
          </div>
          <div>
            <Button
              size="small"
              onClick={() => {
                handleClose();
                dispatch(sharePatchAsync(patchData));
              }}
              color="primary"
            >
              Save Changes
            </Button>
            <Button
              size="small"
              style={{ marginLeft: "5px" }}
              onClick={handleClose}
              color="secondary"
            >
              Cancel
            </Button>
          </div>
        </div>
        <Divider />
        <DialogContent style={{ marginTop: "5px" }}>
          <DialogContentText>
            Share link, or add users to share with-
            <CopyLink type={props.data.type} id={props.data.id} />
            <Divider />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "15px 0",
              }}
            >
              {props.data.privacy ? (
                <Typography>
                  Only people with access can view the file.
                </Typography>
              ) : (
                <Typography>Anyone with the link can view the file.</Typography>
              )}
              <Button
                onClick={() =>{
                  if(page==="Home"){
                    dispatch(privacyAsync(privReverse))
                  }
                  if(page==="Favourites"){
                    dispatch(favPrivacyAsync(privReverse))
                  }
                  if(page==="Recent"){
                    dispatch(recentPrivacyAsync(privReverse))
                  }
                }}
                startIcon={
                  props.data.privacy ? (
                    <VisibilityIcon />
                  ) : (
                    <VisibilityOffIcon />
                  )
                }
                style={{ color: props.data.privacy ? "green" : "blue" }}
                size="small"
                variant="outlined"
              >
                {props.data.privacy ? "Make Public" : "Make Private"}
              </Button>
            </div>
            <Divider />
          </DialogContentText>
          {patchUsersRenderer.length !== 0 ? (
            <div>
              <div>
                <Typography>Users having access-</Typography>
              </div>
              <div>{patchUsersRenderer}</div>
            </div>
          ) : null}

          <UserSearchField />
        </DialogContent>
      </Dialog>
    </div>
  );
}
