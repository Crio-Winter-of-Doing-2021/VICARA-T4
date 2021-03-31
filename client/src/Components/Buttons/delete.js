import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DeleteIcon from "@material-ui/icons/Delete";
import {
  selectCheckedFolderKeys,
  selectCheckedFileKeys,
  deleteAsync,
} from "../../store/slices/checkBoxSlice";
import { useDispatch, useSelector } from "react-redux";

export default function AlertDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  let checkedFolderKeys = useSelector(selectCheckedFolderKeys);
  let checkedFileKeys = useSelector(selectCheckedFileKeys);
  const dispatch = useDispatch();

  let deleteSelected = (fileData, folderData) => {
    dispatch(deleteAsync(fileData, folderData));
  };

  let deactive =
    checkedFileKeys.length + checkedFolderKeys.length !== 0 ? false : true;


  return (
    <div style={{margin:"10px"}}>
      <Button disabled={deactive} startIcon={<DeleteIcon/>} variant="outlined" color="secondary" onClick={handleClickOpen}>
        Delete
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Files/Folders</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
           Are you sure you want to delete {checkedFileKeys.length + checkedFolderKeys.length} files/folder permanently?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Disagree
          </Button>
          <Button onClick={()=>{handleClose();deleteSelected(checkedFileKeys,checkedFolderKeys)}} color="secondary" autoFocus>
            Yes,&nbsp;delete&nbsp;permanently.
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
