import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";

import DialogTitle from "@material-ui/core/DialogTitle";
import {
  ViewModalState,
  toggleModal,
  fileData,
} from "../../store/slices/fileViewSlice";

import PDFViewer from "./pdfviewer";
import VideoViewer from "./videoRenderer";

export default function AlertDialog() {
  let open = useSelector(ViewModalState);
  let fileInfo = useSelector(fileData);
  const dispatch = useDispatch();

  const { name, url, fileType } = fileInfo;

  //console.log("inside component",fileInfo)

  const handleClose = () => {
    dispatch(toggleModal());
  };

  let fileRenderer = () => {
    if (url !== null) {
      if (fileType === "pdf") {
        return <PDFViewer url={url} />;
      }

      if (fileType === "image") {
        return <img src={url} alt={name} style={{ objectFit: "contain" }} />;
      }

      if (fileType === "video" || fileType === "audio") {
        return <VideoViewer url={url} />;
      }
    }

    return null;
  };

  return (
    <div>
      <Dialog
        maxWidth="xl"
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        style={{ overflow: "auto" }}
      >
        <DialogTitle id="alert-dialog-title">{name}</DialogTitle>
        <DialogContent>
          <div
            style={{
              width: "65vw",
              height: "80vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {fileRenderer()}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
