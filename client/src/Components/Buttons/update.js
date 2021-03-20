import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import EditIcon from '@material-ui/icons/Edit';

import {updateAsync,selectCheckedFolderKeys,selectCheckedFileKeys} from '../../store/slices/checkBoxSlice'
import { useDispatch, useSelector } from "react-redux";
// import DisabledTabs from '../File Structure/NavigationTabs/disabledTabs'

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);

  const dispatch=useDispatch();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const checkedFolderKeys=useSelector(selectCheckedFolderKeys)
  const checkedFileKeys=useSelector(selectCheckedFileKeys)

  const [data,setData]=React.useState('')

  let inputChangeHandler = (e) => {
    e.preventDefault();
    setData(e.target.value)
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleUpdate =()=>{
      handleClose();

      console.log("Files",checkedFileKeys)
      console.log("Folders",checkedFolderKeys)

      let newFileData={}
      let newFolderData={}

      if(checkedFileKeys.length!==0){
        newFileData={
          id:checkedFileKeys[0],
          NAME:data
        }
      }

      if(checkedFolderKeys.length!==0){
        newFolderData={
          id:checkedFolderKeys[0],
          NAME:data
        }
      }

      dispatch(updateAsync(newFileData,newFolderData))
  }

  let deactive= (checkedFolderKeys.length + checkedFileKeys.length)!==1 ?true:false;

  return (
    <div>
      <Button startIcon={<EditIcon/>} disabled={deactive} variant="outlined" color="primary" onClick={handleClickOpen}>
        Update
      </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Update Name</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>
            Location - <DisabledTabs/>
          </DialogContentText> */}
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="New Name"
            type="text"
            onChange={inputChangeHandler}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdate} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
