import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import RestoreFromTrashIcon from '@material-ui/icons/RestoreFromTrash';
import {
  selectCheckedFolderKeys,
  selectCheckedFileKeys,
  restoreAsync,
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

  let restoreSelected = (fileData, folderData) => {
    dispatch(restoreAsync(fileData, folderData));
  };

  let deactive =
    checkedFileKeys.length + checkedFolderKeys.length !== 0 ? false : true;


  return (
    <div style={{margin:"10px"}}>
      <Button disabled={deactive} startIcon={<RestoreFromTrashIcon/>} variant="outlined" onClick={handleClickOpen}>
        Restore
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Restore Files/Folders</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            After agreeing, {checkedFileKeys.length + checkedFolderKeys.length} selected files/folder will get restored?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Disagree
          </Button>
          <Button onClick={()=>{handleClose();restoreSelected(checkedFileKeys,checkedFolderKeys)}} color="primary" autoFocus>
            Yes,&nbsp;Restore.
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
