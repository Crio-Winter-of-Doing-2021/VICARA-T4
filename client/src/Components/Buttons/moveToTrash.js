import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import DeleteSweepIcon from "@material-ui/icons/DeleteSweep";

import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { ListItemText } from "@material-ui/core";

import { selectChecked } from "../../store/slices/structureSlice";

import { trashAsync } from "../../store/slices/checkBoxSlice";
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

  let trashSelected = (fileData, folderData) => {
    dispatch(trashAsync(fileData, folderData));
  };

  const handleClick = () => {
    handleCloseOfRightClickMenu();
    handleClickOpen();
  };

  return (
    <div>
      <MenuItem onClick={handleClick}>
        <ListItemIcon>
          <DeleteSweepIcon color="primary" />
        </ListItemIcon>
        <ListItemText style={{ paddingRight: "15px" }}>
          Move to Trash
        </ListItemText>
      </MenuItem>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Move to Trash</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            After agreeing, {checkedFile.length + checkedFolder.length}{" "}
            files/folder will be moved to trash?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Disagree
          </Button>
          <Button
            onClick={() => {
              handleClose();
              trashSelected(checkedFile, checkedFolder);
            }}
            color="primary"
            autoFocus
          >
            Move to Trash
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
