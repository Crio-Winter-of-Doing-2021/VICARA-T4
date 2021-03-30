import React, { useCallback ,useState} from "react";
import {useSelector,useDispatch} from 'react-redux'
import { useDropzone } from "react-dropzone";
import axios from "axios";
import {baseURL,token as AuthToken} from '../../axios'

import {fileLoading,fileUploadLoader} from '../../store/slices/loaderSlice'
import UploadLoader from '../Loaders/fileUploadBackdrop'
import {pushToCurrentStack} from '../../store/slices/structureSlice'
import FolderIcon from '@material-ui/icons/Folder';
import Button from '@material-ui/core/Button';
import { Typography } from "@material-ui/core";
import DevicesIcon from '@material-ui/icons/Devices';

function App(props) {

  const dispatch = useDispatch()

  let loading=useSelector(fileLoading)

  let [progress,setProgress]=useState(0)

  const onDrop = useCallback(async (acceptedFiles) => {
    console.log(acceptedFiles);

    setProgress(0);
    dispatch(fileUploadLoader());

    let pathJSON = [];
    const formData = new FormData();
    for (let [index, val] of acceptedFiles.entries()) {
      pathJSON[index] = val.path; // comment this for multi-file
      formData.append("file", val);
    }
    formData.append("PARENT",props.parent);

    // comment this for multi-file             [START]
    pathJSON = JSON.stringify(pathJSON);
    const blob = new Blob([pathJSON], {
      type: "application/json",
    });
    formData.append("PATH", blob);
    // comment this for multi-file             [END]
    formData.append("PATH", blob);
    const url =  `${baseURL}/api/folder/upload-folder/`;
    const token = AuthToken;
    const headers = {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
      Authorization: `Token ${token}`,
    };
    await axios({
      method: "post",
      url,
      data: formData,
      onUploadProgress: (ev) => {
        const prog = (ev.loaded / ev.total) * 100;
        setProgress(Math.round(prog));
        console.log({ progress });
      },
      headers,
    })
      .then(function (res) {
        //handle success
        console.log(res)
        let newData={
          data:res.data,
          type:"folder"
        }
        dispatch(pushToCurrentStack(newData));
        props.modalClose()
        dispatch(fileUploadLoader());
      })
      .catch(function (response) {
        //handle error
        dispatch(fileUploadLoader());
        props.modalClose()
        console.log(response);
      });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div style={{height:"150px",position:"relative",width:"100%",display:"flex",justifyContent:"center",alignItems:"center"}} {...getRootProps()}>
      <UploadLoader progress={progress} show={loading} />
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
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",color:"gray"}}>
        <FolderIcon/>
        <Typography  style={{marginLeft:"10px"}}>Drop folder here</Typography>
        </div>
        <Typography style={{margin:"10px",textAlign:"center",color:"grey",fontStyle:"italic",fontSize:"12px"}}>OR</Typography>
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",color:"gray"}}>
        <DevicesIcon/>
        <Typography style={{marginLeft:"10px"}}>Click to select from Device</Typography>
        </div>
     </div>
        
      )}
    </div>
  );
}

export default App;
