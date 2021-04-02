import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ShareIcon from "@material-ui/icons/Share";

import UserSearchField from './users'

import {Divider, ListItem, ListItemText,MenuItem,ListItemIcon, Typography,Avatar,Chip} from '@material-ui/core'
import { useDispatch, useSelector } from "react-redux";

import {setPatchUsersDefault,selectPatchUsers,updatePatchUsers} from '../../store/slices/shareSlice'

export default function FormDialog(props) {
  const [open, setOpen] = React.useState(false);

  const dispatch=useDispatch()

  let patchUsers=[]
  patchUsers=useSelector(selectPatchUsers)

  const handleDelete = (e,user) => {
    e.preventDefault();
    dispatch(updatePatchUsers(user))
  };

  let patchUsersRenderer= patchUsers.map(user=>{
    return(
      <Chip
        style={{margin:"2px"}}
        icon={<Avatar style={{width:"20px",height:"20px"}} alt={user.username} src={user.profile_picture_url} />}
        label={user.username}
        onDelete={(e)=>handleDelete(e,user)}
        color="primary"
      />
    )
  })

  const handleClose = () => {
    setOpen(false);
  };
  

  return (
    <div>
      <MenuItem onClick={()=>{props.menuClose();setOpen(true);dispatch(setPatchUsersDefault(props.data.shared_among))}}>
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
            {patchUsersRenderer.length!==0?<div>
              <div>
                <Typography>Users Shared with-</Typography>
              </div>
              <div>
                {patchUsersRenderer}
              </div>
            </div>:null}

          <UserSearchField/>
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
