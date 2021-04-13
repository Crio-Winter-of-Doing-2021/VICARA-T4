import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import DeleteIcon from "@material-ui/icons/Delete";

import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { ListItemText } from "@material-ui/core";

import { selectChecked } from "../../store/slices/structureSlice";

import { deleteAsync } from "../../store/slices/checkBoxSlice";
import { useDispatch, useSelector } from "react-redux";

export default function AlertDialog({ handleCloseOfRightClickMenu, ...data }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  let checkedFileFolder = useSelector(selectChecked);

  let checkedFolder = checkedFileFolder.filter((ele) => ele.type === "folder");
  let checkedFile = checkedFileFolder.filter((ele) => ele.type === "file");
  const dispatch = useDispatch();

  let deleteSelected = (fileData, folderData) => {
    dispatch(deleteAsync(fileData, folderData));
  };

  const handleClick = () => {
    handleCloseOfRightClickMenu();
    handleClickOpen();
  };

  return (
    <div>
      <MenuItem onClick={handleClick}>
        <ListItemIcon>
          <DeleteIcon color="secondary" />
        </ListItemIcon>
        <ListItemText style={{ paddingRight: "15px" }}>Delete</ListItemText>
      </MenuItem>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Files/Folders</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete{" "}
            {checkedFile.length + checkedFolder.length} files/folder
            permanently?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Disagree
          </Button>
          <Button
            onClick={() => {
              handleClose();
              deleteSelected(checkedFile, checkedFolder);
            }}
            color="secondary"
            autoFocus
          >
            Yes,&nbsp;delete&nbsp;permanently.
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
