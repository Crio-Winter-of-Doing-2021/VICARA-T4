import React from 'react';
import {useDispatch} from 'react-redux'
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import API from '../../axios'
import {setProfilePicture} from '../../store/slices/authSlice'
import {pictureLoader} from '../../store/slices/loaderSlice'

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

export default function UploadButtons() {
  const classes = useStyles();

  const dispatch=useDispatch()

  let setPicture=(event)=>{
    dispatch(pictureLoader())
    let picture = event.target.files[0]
    let formData = new FormData();
    formData.append("picture",picture)
    
    API.post(`/api/profile-picture/`,formData,{
        headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
        }
    }).then(res=>{
        let new_pic=res.data.profile_picture_url
        dispatch(setProfilePicture(new_pic))
    }).then(res=>{
        dispatch(pictureLoader())
    }).catch(err=>{
        dispatch(pictureLoader())
    })

  }

  return (
    <div className={classes.root}>
      <input onChange={setPicture} accept="image/*" className={classes.input} id="icon-button-file" type="file" />
      <label htmlFor="icon-button-file">
        <IconButton color="primary" aria-label="upload picture" component="span">
          <PhotoCamera style={{backgroundColor:"white",padding:"3px",borderRadius:"50%"}} />
        </IconButton>
      </label>
    </div>
  );
}
