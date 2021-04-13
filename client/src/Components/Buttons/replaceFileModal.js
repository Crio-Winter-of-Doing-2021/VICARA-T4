import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import {
  fileLoading,
  fileUploadLoader,
  normalLoader,
} from "../../store/slices/loaderSlice";
import UploadLoader from "../Loaders/fileUploadBackdrop";
import { updateStorageData } from "../../store/slices/authSlice";
import {
  updateChild,
  selectReplaceModal,
  toggleReplaceModal,
} from "../../store/slices/structureSlice";
import API from "../../axios";

import { error, success } from "../../store/slices/logSlice";

export default function AlertDialog() {
  const modalData = useSelector(selectReplaceModal);
  const dispatch = useDispatch();
  const loading = useSelector(fileLoading);

  const [progress, setProgress] = React.useState(0);

  const handleClose = () => {
    dispatch(toggleReplaceModal());
  };
  const handleReplace = () => {
    const { url, formData } = modalData.requestData;
    // to close the modal
    dispatch(toggleReplaceModal());

    if (url === "/api/folder/") {
      dispatch(normalLoader());
      API.post("/api/folder/", formData)
        .then((res) => {
          dispatch(updateChild(res.data));
          const { readable, ratio } = res.data;
          dispatch(updateStorageData({ readable, ratio }));
          dispatch(normalLoader());
          dispatch(success("Your Action was Successful"));
        })
        .catch((err) => {
          dispatch(error(err.response.data.message));
          dispatch(normalLoader());
        });
    } else {
      dispatch(fileUploadLoader());
      API.post(url, formData, {
        onUploadProgress: (ev) => {
          const prog = (ev.loaded / ev.total) * 100;
          setProgress(Math.round(prog));
          //console.log({ progress });
        },
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      })
        .then(function (res) {
          //handle success
          //console.log(res);
          let k;
          for (k = 0; k < res.data.file_data.length; k++) {
            dispatch(updateChild(res.data.file_data[k]));
          }

          //console.log("data = ", res.data);
          const { readable, ratio } = res.data;
          dispatch(updateStorageData({ readable, ratio }));
          dispatch(fileUploadLoader());
          dispatch(success("Your Action was Successful"));
        })
        .catch(function (err) {
          dispatch(error(err.response.data.message));

          dispatch(fileUploadLoader());
        });
    }
  };
  console.log({ modalData });
  return (
    <div>
      <UploadLoader progress={progress} show={loading} />
      <Dialog
        open={modalData.show}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {modalData.type.toUpperCase() + "(s)"} Already Exist
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {modalData.data.map((item) => (
              <li>{item.name}</li>
            ))}
            The given {modalData.type}(s), already exist, do you wish to
            replace?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Disagree
          </Button>
          <Button
            onClick={handleReplace}
            style={{ color: "darkblue" }}
            autoFocus
          >
            Yes, Replace
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
