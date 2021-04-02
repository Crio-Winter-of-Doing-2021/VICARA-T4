import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ShareIcon from "@material-ui/icons/Share";

import {Divider, ListItem, ListItemText,MenuItem,ListItemIcon} from '@material-ui/core'
import { useDispatch, useSelector } from "react-redux";

export default function FormDialog(props) {
  const [open, setOpen] = React.useState(false);

  const dispatch = useDispatch();
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <MenuItem onClick={()=>{props.menuClose();setOpen(true)}}>
          <ListItemIcon>
            <ShareIcon color="primary" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
      </MenuItem>
      <Dialog fullWidth open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Share with Users</DialogTitle>
        <Divider/>
        <DialogContent>
          <DialogContentText>
            Share link, or add users to share with-
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="Add"
            label="Add people"
            type=""
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
