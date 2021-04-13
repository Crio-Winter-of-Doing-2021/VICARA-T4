import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import RestoreFromTrashIcon from "@material-ui/icons/RestoreFromTrash";

import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { ListItemText } from "@material-ui/core";

import { selectChecked } from "../../store/slices/structureSlice";

import { restoreAsync } from "../../store/slices/checkBoxSlice";
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

  let restoreSelected = (fileData, folderData) => {
    dispatch(restoreAsync(fileData, folderData));
  };

  const handleClick = () => {
    handleCloseOfRightClickMenu();
    handleClickOpen();
  };

  return (
    <div>
      <MenuItem onClick={handleClick}>
        <ListItemIcon>
          <RestoreFromTrashIcon color="primary" />
        </ListItemIcon>
        <ListItemText style={{ paddingRight: "15px" }}>Restore</ListItemText>
      </MenuItem>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Restore Files/Folders</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            After agreeing, {checkedFile.length + checkedFolder.length}{" "}
            files/folder will get restored?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Disagree
          </Button>
          <Button
            onClick={() => {
              handleClose();
              restoreSelected(checkedFile, checkedFolder);
            }}
            color="primary"
            autoFocus
          >
            Restore
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
