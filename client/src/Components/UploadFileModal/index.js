import React from "react";
import { useDispatch } from "react-redux";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
// import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import {
  Divider,
  Typography,
  ListItemText,
  ListItem,
  Avatar,
  ListItemAvatar,
} from "@material-ui/core";
import AddFile from "./App-multi-file";
// import { token, baseURL } from "../../axios";
// import axios from "axios";
import { normalLoader } from "../../store/slices/loaderSlice";
import { updateChild } from "../../store/slices/structureSlice";

import { updateStorageData } from "../../store/slices/authSlice";
// import FileBackdropLoader from '../Loaders/fileUploadBackdrop'
import DescriptionIcon from "@material-ui/icons/Description";

import API from "../../axios";
import { error, success } from "../../store/slices/logSlice";

export default function FormDialog(props) {
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState({
    PARENT: props.parent,
    NAME: "",
    DRIVE_URL: "",
    REPLACE: false,
  });

  // let loading = useSelector(fileLoading);

  const dispatch = useDispatch();

  let inputChangeHandler = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  let uploadLink = () => {
    // /api/file/upload-by-url/

    dispatch(normalLoader());

    API.post("/api/file/upload-by-url/", state)
      .then((res) => {
        // console.log(res.data);
        dispatch(updateChild(res.data.file_data));
        const { readable, ratio } = res.data;
        dispatch(updateStorageData({ readable, ratio }));
        dispatch(normalLoader());
        dispatch(success("Your Action was Successful"));
        handleClose();
      })
      .catch((err) => {
        console.log(err);
        dispatch(normalLoader());
        handleClose();
        //console.log(err.response)
        dispatch(error(err.response.data.message));
      });
  };

  return (
    <div>
      {/* <FileBackdropLoader progress={progress} show={loading} /> */}
      {/* {//console.log(state)} */}
      <ListItem
        style={{ cursor: "pointer" }}
        onClick={() => {
          handleClickOpen();
        }}
      >
        <ListItemAvatar>
          <Avatar>
            <DescriptionIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Files" />
      </ListItem>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle
          style={{ backgroundColor: "black", color: "white" }}
          id="form-dialog-title"
        >
          Upload Files
        </DialogTitle>
        <Divider />
        <DialogContent style={{ margin: "15px 0" }}>
          <DialogContentText>
            Enter an appropriate name with a downloadable URL in the blank
            fields below to upload it to your drive.
          </DialogContentText>
          <TextField
            id="NAME"
            name="NAME"
            label="Name"
            type="text"
            fullWidth
            style={{ margin: "10px 0" }}
            onChange={inputChangeHandler}
          />
          <TextField
            id="DRIVE_URL"
            name="DRIVE_URL"
            label="Downloadable URL"
            type="text"
            onChange={inputChangeHandler}
            fullWidth
          />
        </DialogContent>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "30px 0",
          }}
        >
          <Typography>OR</Typography>
        </div>

        <DialogContent>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "150px",
              border: "2px dashed grey",
              borderRadius: "5px",
            }}
          >
            <AddFile modalClose={handleClose} parent={props.parent} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleClose();
              uploadLink();
            }}
            color="primary"
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
