import React,{useEffect} from 'react';
import {useDispatch} from 'react-redux'
import {useSelector} from 'react-redux'
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { ListItemText,List, Divider } from "@material-ui/core";

import FlipToFrontIcon from '@material-ui/icons/FlipToFront';
import {selectParent} from '../../../store/slices/moveSlice'

import FolderView from './folderView'
import Path from './folderNavigation'

import {folderPickerLoading} from '../../../store/slices/loaderSlice'
import LinearProgress from '@material-ui/core/LinearProgress';

import {getFolderPickerView,pathAsync} from '../../../store/slices/moveSlice'

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

export default function CustomizedDialogs({ handleCloseOfRightClickMenu,
  ...data
}) {
  const [open, setOpen] = React.useState(false);

  let parent=useSelector(selectParent)

  let loading=useSelector(folderPickerLoading)

  const dispatch=useDispatch()

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleClick = () => {
    handleCloseOfRightClickMenu();
    handleClickOpen();
  };

  return (
    <div>
      <MenuItem onClick={handleClick}>
        <ListItemIcon>
          <FlipToFrontIcon color="secondary" />
        </ListItemIcon>
        <ListItemText style={{ paddingRight: "15px" }}>Move Selected</ListItemText>
      </MenuItem>
      <Dialog fullWidth onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle style={{backgroundColor:"black",color:"white"}} id="customized-dialog-title" onClose={handleClose}>
          Move to {parent}
        </DialogTitle>
        <DialogContent dividers>
          <div>
            <Path/>
          </div>
          {loading?<LinearProgress/>:<Divider/>}
            <div style={{width:"100%",marginTop:"10px",minHeight:"35vh"}}>
                <List dense={true}>
                  <FolderView/>
                </List> 
            </div>
            
          
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
