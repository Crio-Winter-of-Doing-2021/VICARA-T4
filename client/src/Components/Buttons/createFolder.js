import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
// import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from "@material-ui/core/DialogTitle";
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder";

import { addFolderAsync } from "../../store/slices/structureSlice";
import { useDispatch } from "react-redux";
// import DisabledTabs from '../File Structure/NavigationTabs/disabledTabs'

export default function FormDialog(props) {
  const [open, setOpen] = React.useState(false);

  const dispatch = useDispatch();

  const handleClickOpen = () => {
    setOpen(true);
  };

  let [data, setData] = React.useState({
    NAME: "",
    TYPE: "",
    PARENT: "",
  });

  let inputChangeHandler = (e) => {
    e.preventDefault();
    setData({
      name: e.target.value,
      PARENT: props.id,
      REPLACE: "false",
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAdd = () => {
    handleClose();
    dispatch(addFolderAsync(data));
  };

  return (
    <div style={{ margin: "10px" }}>
      <Button
        startIcon={<CreateNewFolderIcon />}
        variant="outlined"
        color="primary"
        onClick={handleClickOpen}
      >
        Create Folder
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Add Folder</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>
            Folder will be added to - <DisabledTabs/>
          </DialogContentText> */}
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Folder Name"
            type="text"
            onChange={inputChangeHandler}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAdd} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
