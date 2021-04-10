import React from 'react';
import {useDispatch,useSelector} from 'react-redux'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {selectReplaceModalStatus,toggleReplaceModalStatus} from '../../store/slices/structureSlice'

export default function AlertDialog() {
  

  let status=useSelector(selectReplaceModalStatus)
  const dispatch=useDispatch()

  const handleClose = () => {
    dispatch(toggleReplaceModalStatus())
  };

  return (
    <div>
      <Dialog
        open={status.show}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{(status.type).toUpperCase()} Already Exist</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            The {status.type} with given name, already exist, do you wish to replace it?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Disagree
          </Button>
          <Button onClick={handleClose} style={{color:"darkblue"}} autoFocus>
            Yes, Replace
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
