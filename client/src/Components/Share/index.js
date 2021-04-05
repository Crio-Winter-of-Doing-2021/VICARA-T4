import React from "react";
import Button from "@material-ui/core/Button";

import Dialog from "@material-ui/core/Dialog";

import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";

import ShareIcon from "@material-ui/icons/Share";
import CopyLink from "./copyClipboard";
import UserSearchField from "./users";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";

import {
  Divider,
  ListItemText,
  MenuItem,
  ListItemIcon,
  Typography,
  Avatar,
  Chip,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";

import {
  setUsersWithAccess,
  removeUsersWithAccess,
  selectUsersWithAccess,
} from "../../store/slices/shareSlice";
import { updateChildAsync } from "../../store/slices/structureSlice";

export default function FormDialog(props) {
  const [open, setOpen] = React.useState(false);

  const dispatch = useDispatch();
  const usersWithAccess = useSelector(selectUsersWithAccess);
  const handleDelete = (e, user) => {
    e.preventDefault();
    dispatch(removeUsersWithAccess(user.id));
  };

  const usersWithAccessRenderer = Object.keys(usersWithAccess).map(function (
    key,
    index
  ) {
    const user = usersWithAccess[key];
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
  const idsOfUserWithAccess = Object.keys(usersWithAccess).map(function (
    key,
    index
  ) {
    return key;
  });

  const handleClose = () => {
    setOpen(false);
  };
  const { shared_among, type, id, privacy } = props.data;
  return (
    <div>
      <MenuItem
        onClick={() => {
          props.menuClose();
          setOpen(true);
          shared_among.forEach((user) => {
            dispatch(setUsersWithAccess(user));
          });
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
                dispatch(
                  updateChildAsync({
                    shared_among: idsOfUserWithAccess,
                    type,
                    id,
                  })
                );
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
            <CopyLink type={type} id={id} />
            <Divider />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "15px 0",
              }}
            >
              {privacy ? (
                <Typography>
                  Only people with access can view the file.
                </Typography>
              ) : (
                <Typography>Anyone with the link can view the file.</Typography>
              )}
              <Button
                onClick={() =>
                  dispatch(
                    updateChildAsync({
                      id,
                      type,
                      privacy: !privacy,
                    })
                  )
                }
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
                {privacy ? "Make Public" : "Make Private"}
              </Button>
            </div>
            <Divider />
          </DialogContentText>
          {usersWithAccessRenderer.length !== 0 ? (
            <div>
              <div>
                <Typography>Users having access-</Typography>
              </div>
              <div>{usersWithAccessRenderer}</div>
            </div>
          ) : null}

          <UserSearchField />
        </DialogContent>
      </Dialog>
    </div>
  );
}
