import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";

import UploadUtil from "../../store/slices/fileUpload";

import { fileUploadLoader, fileLoading } from "../../store/slices/loaderSlice";

import BackDropLoader from "../Loaders/fileUploadBackdrop";
import API from "../../axios";
const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
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
    // event.preventDefault();
    let currentFile = event.target.files[0];

    console.log(currentFile);

    setProgress(0);
    // dispatch(fileUploadLoader());
    let formData = new FormData();

    formData.append("file", currentFile);
    formData.append("PARENT", props.parent);

    API.post(
      "/api/file/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
      {onUploadProgress:(event) => {
        console.log("progress i was called");
        setProgress(Math.round((100 * event.loaded) / event.total));
        console.log("progress", progress);
      }}
    )
      .then((res) => {
        // dispatch(fileUploadLoader());
        console.log("res from upload ", res);
      })
      .catch((err) => {
        // dispatch(fileUploadLoader());
        console.log(err);
      });
  };

  return (
    <div className={classes.root}>
      {progress}
      {/* <BackDropLoader show={loading}/> */}
      <input
        className={classes.input}
        id="contained-button-file"
        multiple
        type="file"
        onChange={selectFile}
      />
      <label htmlFor="contained-button-file">
        <Button
          startIcon={<InsertDriveFileIcon />}
          variant="contained"
          color="primary"
          component="span"
        >
          Add File
        </Button>
      </label>
    </div>
  );
}