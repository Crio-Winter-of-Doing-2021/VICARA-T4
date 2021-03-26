import React from 'react';
import {useDispatch,useSelector} from 'react-redux'
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Users from './userList'
import useMediaQuery from '@material-ui/core/useMediaQuery';


import {userAsyncPatch,selectPatchUsers} from '../../../store/slices/shareSlice'

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

export default function CustomizedDialogs(props) {
  const [open, setOpen] = React.useState(false);
  const dispatch=useDispatch();

  let patchUsers=useSelector(selectPatchUsers);

  const handleClickOpen = () => {
    setOpen(true);
  };

  let patchData={
    id:props.id,
    USERS:patchUsers
  }

  const handleClose = () => {
    setOpen(false);
    
  };

 
  return (
    <div>
      <Button 
      size="small"
      variant="contained" 
      color="secondary"
      style={{marginLeft:"5px",fontWeight:"bold"}} 
      onClick={handleClickOpen}
      >
        Add User
      </Button>
      <Dialog fullWidth={true}  onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          <Typography variant="h6" style={{fontWeight:"bold"}}>
            Select users to share your file
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <div style={{display:"flex",justifyContent:"center"}}>
            <Users author={props.author}/>
          </div>
        </DialogContent>
        <DialogActions>
          <Button style={{fontWeight:"bold"}} autoFocus onClick={()=>{handleClose();dispatch(userAsyncPatch(patchData))}} color="primary">
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
