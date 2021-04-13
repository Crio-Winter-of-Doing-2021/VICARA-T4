import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useDropzone } from "react-dropzone";
import API from "../../axios";

import { fileLoading, fileUploadLoader } from "../../store/slices/loaderSlice";
import UploadLoader from "../Loaders/fileUploadBackdrop";
import {
  updateChild,
  toggleReplaceModal,
} from "../../store/slices/structureSlice";
import { updateStorageData } from "../../store/slices/authSlice";
import FolderIcon from "@material-ui/icons/Folder";
// import Button from '@material-ui/core/Button';
import { Typography } from "@material-ui/core";
import DevicesIcon from "@material-ui/icons/Devices";
import { error, success } from "../../store/slices/logSlice";

function App({ modalClose, parent }) {
  const dispatch = useDispatch();

  let loading = useSelector(fileLoading);

  let [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      //console.log(acceptedFiles);

      setProgress(0);
      dispatch(fileUploadLoader());

      let pathJSON = [];
      const formData = new FormData();
      for (let [index, val] of acceptedFiles.entries()) {
        pathJSON[index] = val.path; // comment this for multi-file
        formData.append("file", val);
      }
      formData.append("PARENT", parent);

      pathJSON = JSON.stringify(pathJSON);
      const blob = new Blob([pathJSON], {
        type: "application/json",
      });
      formData.append("PATH", blob);
      formData.append("REPLACE", false);

      API.post("/api/folder/upload-folder/", formData, {
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

          dispatch(updateChild(res.data));
          modalClose();
          const { readable, ratio } = res.data;
          dispatch(updateStorageData({ readable, ratio }));
          dispatch(fileUploadLoader());
          dispatch(success("Your Action was Successful"));
        })
        .catch(function (err) {
          const statusCode = err.response.request.status;

          if (
            statusCode === 400 &&
            err.response.data.error_code === "DUPLICATE_FOLDER"
          ) {
            formData.set("REPLACE", "true");
            dispatch(
              toggleReplaceModal({
                type: "folder",
                data: err.response.data.data,
                requestData: {
                  url: "/api/folder/upload-folder/",
                  formData,
                },
              })
            );
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
          directory=""
          webkitdirectory=""
          type="file"
        />
        {isDragActive ? (
          <p>Drop the folder here ...</p>
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
              <FolderIcon />
              <Typography style={{ marginLeft: "10px" }}>
                Drop folder here
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
