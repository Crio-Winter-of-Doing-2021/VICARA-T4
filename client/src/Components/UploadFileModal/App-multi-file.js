import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useDropzone } from "react-dropzone";
// import axios from "axios";
// import { baseURL, token as AuthToken } from "../../axios";
import API from "../../axios";
import { fileLoading, fileUploadLoader } from "../../store/slices/loaderSlice";
import UploadLoader from "../Loaders/fileUploadBackdrop";
import {
  updateChild,
  toggleReplaceModal,
} from "../../store/slices/structureSlice";
import { updateStorageData } from "../../store/slices/authSlice";
// import Button from '@material-ui/core/Button';
import { Typography } from "@material-ui/core";
import DevicesIcon from "@material-ui/icons/Devices";
import InsertDriveFileOutlinedIcon from "@material-ui/icons/InsertDriveFileOutlined";
import { error, success } from "../../store/slices/logSlice";

function App({ parent, modalClose }) {
  const dispatch = useDispatch();

  let loading = useSelector(fileLoading);

  let [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      // //console.log(acceptedFiles);

      setProgress(0);
      dispatch(fileUploadLoader());

      // let pathJSON = [];
      const formData = new FormData();
      for (let [index, val] of acceptedFiles.entries()) {
        console.log(index);
        // pathJSON[index] = val.path; // comment this for multi-file
        formData.append("file", val);
      }
      formData.append("PARENT", parent);
      formData.append("REPLACE", 0);

      API.post("/api/file/", formData, {
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
          modalClose();
          //console.log("data = ", res.data);
          const { readable, ratio } = res.data;
          dispatch(updateStorageData({ readable, ratio }));
          dispatch(fileUploadLoader());
          dispatch(success("Your Action was Successful"));
        })
        .catch(function (err) {
          //handle error
          const statusCode = err.response.request.status;

          if (
            statusCode === 400 &&
            err.response.data.error_code === "DUPLICATE_FILE"
          ) {
            console.log("backend res = ", err.response.data);
            formData.set("REPLACE", "true");
            dispatch(
              toggleReplaceModal({
                type: "file",
                data: err.response.data.data,
                requestData: {
                  url: "/api/file/",
                  formData,
                },
              })
            );
            // formData.append("", parent);
          } else {
            dispatch(error(err.response.data.message));
          }

          dispatch(fileUploadLoader());
          modalClose();
        });
    },
    [dispatch, modalClose, parent]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <>
      <UploadLoader progress={progress} show={loading} />
      <div
        style={{
          height: "150px",
          position: "relative",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        {...getRootProps()}
      >
        <input
          {...getInputProps()}
          // comment the 2 below for multi-file
          // directory=""
          // webkitdirectory=""
          type="file"
        />
        {isDragActive ? (
          <p>Drop your files here ...</p>
        ) : (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "gray",
              }}
            >
              <InsertDriveFileOutlinedIcon />
              <Typography style={{ marginLeft: "10px" }}>
                Drop files here
              </Typography>
            </div>
            <Typography
              style={{
                margin: "10px",
                textAlign: "center",
                color: "grey",
                fontStyle: "italic",
                fontSize: "12px",
              }}
            >
              OR
            </Typography>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "gray",
              }}
            >
              <DevicesIcon />
              <Typography style={{ marginLeft: "10px" }}>
                Click to select from Device
              </Typography>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
