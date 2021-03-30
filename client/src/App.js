import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

function App() {
  const onDrop = useCallback(async (acceptedFiles) => {
    // console.log(acceptedFiles);
    let pathJSON = [];
    const formData = new FormData();
    for (let [index, val] of acceptedFiles.entries()) {
      // pathJSON[index] = val.path; // comment this for multi-file
      formData.append("file", val);
    }
    formData.append("PARENT", 6);

    // comment this for multi-file             [START]
    // pathJSON = JSON.stringify(pathJSON);
    // const blob = new Blob([pathJSON], {
    //   type: "application/json",
    // });
    // formData.append("PATH", blob);
    // formData.append("PATH", blob);
    // comment this for multi-file             [END]
    // const url = "http://localhost:8000/api/folder/upload-folder/";
    const url = "http://localhost:8000/api/file/";
    const token = "37eb746e817e37c521210ae43273701383b414b1";
    const headers = {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
      Authorization: `Token ${token}`,
    };
    await axios({
      method: "post",
      url,
      data: formData,
      headers,
    })
      .then(function (response) {
        //handle success
        console.log(response);
      })
      .catch(function (response) {
        //handle error
        console.log(response);
      });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input
        {...getInputProps()}
        // comment the 2 below for multi-file
        // directory=""
        // webkitdirectory=""
        type="file"
      />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag 'n' drop some files here, or click to select files</p>
      )}
    </div>
  );
}

export default App;
