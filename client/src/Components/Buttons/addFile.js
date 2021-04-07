import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import DevicesIcon from "@material-ui/icons/Devices";

import axios from "axios";

import { fileUploadLoader, fileLoading } from "../../store/slices/loaderSlice";

import { pushToCurrentStack } from "../../store/slices/structureSlice";

import BackDropLoader from "../Loaders/fileUploadBackdrop";
import { baseURL, token } from "../../axios";
const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      marginRight: theme.spacing(1),
    },
  },
  input: {
    display: "none",
  },
}));

export default function UploadButtons(props) {
  const classes = useStyles();

  let loading = useSelector(fileLoading);
  const dispatch = useDispatch();

  const [progress, setProgress] = useState(0);

  const selectFile = (event) => {
    event.preventDefault();
    let currentFile = event.target.files[0];

    //console.log(currentFile);

    setProgress(0);
    dispatch(fileUploadLoader());
    let formData = new FormData();

    formData.append("file", currentFile);
    formData.append("PARENT", props.parent);

    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Token ${token}`,
      },
      data: formData,
      url: `${baseURL}/api/file/`,
      onUploadProgress: (ev) => {
        const prog = (ev.loaded / ev.total) * 100;
        setProgress(Math.round(prog));
        //console.log({ progress });
      },
    })
      .then((res) => {
        let newData = {
          data: res.data,
          type: "file",
        };
        dispatch(pushToCurrentStack(newData));
        dispatch(fileUploadLoader());
        props.modalClose();
      })
      .catch((err) => {
        dispatch(fileUploadLoader());
        //console.log(err);
        props.modalClose();
      });
  };

  return (
    <div className={classes.root}>
      <BackDropLoader progress={progress} show={loading} />
      <input
        className={classes.input}
        id="contained-button-file"
        multiple
        type="file"
        onChange={selectFile}
      />
      <label htmlFor="contained-button-file">
        <Button
          disableElevation
          startIcon={<DevicesIcon />}
          variant="contained"
          style={{
            backgroundColor: "lightgrey",
          }}
          component="span"
        >
          Select from Device
        </Button>
      </label>
    </div>
  );
}
