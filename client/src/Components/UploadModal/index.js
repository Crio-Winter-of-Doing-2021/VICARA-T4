import React from 'react';
import {useDispatch,useSelector} from 'react-redux'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import { Divider, Typography } from '@material-ui/core';
import AddFile from '../Buttons/addFile'
import {token,baseURL} from '../../axios'
import axios from 'axios'
import {fileUploadLoader,fileLoading} from '../../store/slices/loaderSlice'
import {pushToCurrentStack} from '../../store/slices/structureSlice'
import FileBackdropLoader from '../Loaders/fileUploadBackdrop'

export default function FormDialog(props) {
  const [open,setOpen]=React.useState(false)
  const [state, setState] = React.useState({
      PARENT:props.parent,
      NAME:"",
      DRIVE_URL:""
  });

  let loading = useSelector(fileLoading)

  const dispatch=useDispatch();

  const [progress, setProgress] = React.useState(0);

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

  let uploadLink=()=>{

    setProgress(0);
    dispatch(fileUploadLoader());
    axios({
        method: "post",
        headers: {
          Authorization: `Token ${token}`,
        },
        data: state,
        url: `${baseURL}/upload-by-url/`,
        onUploadProgress: (ev) => {
          const prog = (ev.loaded / ev.total) * 100;
          setProgress(Math.round(prog));
          console.log({ progress });
        },
      })
        .then((res) => {
          let newData={
            data:res.data,
            type:"file"
          }
          dispatch(pushToCurrentStack(newData));
          dispatch(fileUploadLoader());
          handleClose()
        })
        .catch((err) => {
          dispatch(fileUploadLoader());
          handleClose();
          console.log(err);
        });
  }

  return (
    <div>
      <FileBackdropLoader progress={progress} show={loading} />
      <Button startIcon={<InsertDriveFileIcon/>} variant="outlined" color="primary" onClick={handleClickOpen}>
        Upload Files
      </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Upload Files</DialogTitle>
        <Divider/>
        <DialogContent style={{margin:"15px 0"}}>
          <DialogContentText>
            Enter an appropriate name with a downloadable URL in the blank fields below to upload it to your drive.
          </DialogContentText>
          <TextField
            id="NAME"
            label="Name"
            type="text"
            fullWidth
            style={{margin:"10px 0"}}
            onChange={inputChangeHandler}
          />
          <TextField
            id="DRIVE_URL"
            label="Downloadable URL"
            type="text"
            onChange={inputChangeHandler}
            fullWidth
          />
        </DialogContent>
        <div style={{display:"flex",justifyContent:"center",margin:"30px 0 0 0"}}>
            <Typography>OR</Typography>
        </div>

        <DialogContent>
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100px"}}>
            <AddFile modalClose={handleClose} parent={props.parent}/>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={()=>{handleClose();uploadLink()}} color="primary">
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
