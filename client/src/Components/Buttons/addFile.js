import React,{useState,useEffect} from 'react';
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';

import UploadUtil from '../../store/slices/fileUpload'

import {fileUploadLoader,fileLoading} from '../../store/slices/loaderSlice'

import BackDropLoader from '../Loaders/fileUploadBackdrop'

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  input: {
    display: 'none',
  },
}));

export default function UploadButtons(props) {
  const classes = useStyles();

  let loading = useSelector(fileLoading)
  const dispatch = useDispatch();

  const [selectedFiles, setSelectedFiles] = useState(undefined);
  const [currentFile, setCurrentFile] = useState(undefined);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const [fileInfos, setFileInfos] = useState([]);

  const selectFile = (event) => {
    // event.preventDefault();
    setSelectedFiles(event.target.files);

    console.log(selectedFiles)

    // let currentFile = selectedFiles[0];

    // setProgress(0);
    // setCurrentFile(currentFile);

    // UploadUtil.upload(currentFile,props.id,(event) => {
    //   setProgress(Math.round((100 * event.loaded) / event.total));
    // })
    //   .then((res) => {
    //     dispatch(fileUploadLoader())
    //     console.log(res)
    //   })
    //   .catch((err) => {
    //     dispatch(fileUploadLoader())
    //     console.log(err)
    //     setCurrentFile(undefined);
    //   });

    // setSelectedFiles(undefined);


  };

  return (
    <div className={classes.root}>
      {/* <BackDropLoader show={loading}/> */}
      <input
        className={classes.input}
        id="contained-button-file"
        multiple
        type="file"
        onChange={selectFile}
      />
      <label htmlFor="contained-button-file">
        <Button startIcon={<InsertDriveFileIcon/>} variant="contained" color="primary" component="span">
          Add File
        </Button>
      </label>
    </div>
  );
}
