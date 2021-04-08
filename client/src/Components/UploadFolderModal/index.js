import React from "react";
// import { useDispatch, useSelector } from "react-redux";
import Button from "@material-ui/core/Button";
// import TextField from '@material-ui/core/TextField';
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
// import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from "@material-ui/core/DialogTitle";
import FolderIcon from "@material-ui/icons/Folder";
import {
  Divider,
  ListItemText,
  ListItem,
  Avatar,
  ListItemAvatar,
} from "@material-ui/core";
import AddFolder from "./App-upload-folder";
// import {token,baseURL} from '../../axios'
// import axios from 'axios'
// import { fileLoading } from "../../store/slices/loaderSlice";
// import {pushToCurrentStack} from '../../store/slices/structureSlice'
// import FileBackdropLoader from '../Loaders/fileUploadBackdrop'

export default function FormDialog(props) {
  const [open, setOpen] = React.useState(false);

  // let loading = useSelector(fileLoading);

  // const dispatch = useDispatch();

  // const [progress, setProgress] = React.useState(0);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      {/* <FileBackdropLoader progress={progress} show={loading} /> */}
      <ListItem
        style={{ cursor: "pointer" }}
        onClick={() => {
          handleClickOpen();
        }}
      >
        <ListItemAvatar>
          <Avatar>
            <FolderIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Folders" />
      </ListItem>
      <Dialog
        fullWidth
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle style={{backgroundColor:"black",color:"white"}} id="form-dialog-title">Upload Folders</DialogTitle>
        <Divider />
        <DialogContent>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop:"15px",
              height: "150px",
              border: "2px dashed grey",
              borderRadius: "5px",
            }}
          >
            <AddFolder modalClose={handleClose} parent={props.parent} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
