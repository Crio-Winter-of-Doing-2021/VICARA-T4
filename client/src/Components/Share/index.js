import React from 'react';
import {useSelector,useDispatch} from 'react-redux'
import { makeStyles } from '@material-ui/core/styles';

import {selectFileData,selectPath} from '../../store/slices/shareSlice'
import {fileAsync,pathAsync,userAsync,updatePatchUsers,selectPatchUsers,userAsyncPatch} from '../../store/slices/shareSlice'
import {dateParser} from '../../Utilities/dateParser'

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import Chip from '@material-ui/core/Chip';
import FaceIcon from '@material-ui/icons/Face';

import Tooltip from "@material-ui/core/Tooltip";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";

import {privacyAsync} from '../../store/slices/structureSlice'
import {privOpp} from '../Structure/structure'

import AddUser from '../Buttons/addUser/addUser'
import CopytoClipboard from './copyClipboard'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
      },
      heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
        fontWeight:"bold",
        marginLeft:"5px"
      },
      secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
      },
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
    fontWeight:"bold"
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FullScreenDialog(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const dispatch=useDispatch();

  let patchUsers=useSelector(selectPatchUsers)

  console.log(patchUsers)

  let file_id=props.data

  let fileData=useSelector(selectFileData)
  let path=useSelector(selectPath)


  let patchData={
      id:fileData.id,
      USERS:patchUsers
  }

  const handleDelete = (e,value) => {
    e.preventDefault()
    dispatch(updatePatchUsers(value))
    console.log(patchData)
    dispatch(userAsyncPatch(patchData))
  };

  let userRender=fileData.USERS.map(user=>{

        return(
            <Chip
                icon={<FaceIcon />}
                label={user}
                onDelete={(e)=>handleDelete(e,user)}
                
            />
        )
  })

  let time=fileData.TIMESTAMP

  if(fileData.TIMESTAMP!=="Loading..."){
    let res=dateParser(fileData.TIMESTAMP)
    time=res.date + '-' + res.month + '-' + res.year
  }

  let privReverse = {
    id: fileData.id,
    PRIVACY: privOpp(fileData.PRIVACY),
  };

  const handlePrivacy = (e, data) => {
    e.preventDefault();
    dispatch(privacyAsync(data));
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <ListItemText style={{paddingRight:"15px"}} variant="outlined" color="primary" onClick={()=>{
          handleClickOpen();dispatch(fileAsync(file_id));dispatch(pathAsync(file_id));dispatch(userAsync())
        }}>
        Share
      </ListItemText>
      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Share
            </Typography>
            <Button style={{fontWeight:"bold"}} autoFocus color="inherit" onClick={handleClose}>
              Done
            </Button>
          </Toolbar>
        </AppBar>
        <Typography style={{margin:"20px",fontWeight:"bold"}} variant="h6">
            Details:-
        </Typography>
        <Divider light/>
        <List>
          <ListItem >
            <Typography className={classes.heading}>
                Name
            </Typography>
            <Typography className={classes.secondaryHeading}>
                {fileData.NAME}
            </Typography>
          </ListItem>
          {/* <Divider light /> */}
          <ListItem >
            <Typography className={classes.heading}>
                Creator
            </Typography>
            <Typography className={classes.secondaryHeading}>
                {fileData.CREATOR}
            </Typography>
          </ListItem>
          {/* <Divider light/> */}
          <ListItem >
            <Typography className={classes.heading}>
                Date Created
            </Typography>
            <Typography className={classes.secondaryHeading}>
                {time}
            </Typography>
          </ListItem>
          {/* <Divider light/> */}
          <ListItem >
            <Typography className={classes.heading}>
                Favourite
            </Typography>
            <Typography className={classes.secondaryHeading}>
                {fileData.FAVOURITE===true?"Yes":"No"}
            </Typography>
          </ListItem>
          {/* <Divider light/> */}
          <ListItem >
            <Typography className={classes.heading}>
                Privacy
            </Typography>
            <Typography className={classes.secondaryHeading}>
                {fileData.PRIVACY === "PRIVATE" ? (
                <Tooltip title="File is Private">
                <Button 
                    size="small" 
                    variant="contained" 
                    startIcon={<VisibilityOffIcon />} 
                    onClick={(e) => handlePrivacy(e, privReverse)}
                    style={{fontWeight:"bold"}}
                >
                    {fileData.PRIVACY}
                </Button>
                </Tooltip>
            ) : (
                <Tooltip title="File is Public">
                <Button
                    size="small"
                    variant="contained"
                    startIcon={<VisibilityIcon />}
                    onClick={(e) => handlePrivacy(e, privReverse)}
                    color="primary"
                    style={{fontWeight:"bold"}}
                >
                    {fileData.PRIVACY}
                </Button>
                </Tooltip>
            )}
            </Typography>
          </ListItem>
          {/* <Divider light/> */}
          <ListItem >
            <Typography className={classes.heading}>
                Type
            </Typography>
            <Typography className={classes.secondaryHeading}>
                {fileData.TYPE}
            </Typography>
          </ListItem>
          <Divider light/>
        </List>
        <Typography style={{margin:"20px",fontWeight:"bold"}} variant="h6">
            Share Options:-
        </Typography>
        <List>
            <ListItem >
                <Typography className={classes.heading}>
                    Location
                </Typography>
                <Typography className={classes.secondaryHeading}>
                    {path}
                </Typography>
            </ListItem>
            <ListItem >
                <Typography className={classes.heading}>
                    Users Shared With
                </Typography>
                <Typography style={{display:"flex"}} className={classes.secondaryHeading}>
                    {userRender}
                    <AddUser author={fileData.CREATOR} id={fileData.id}/>
                </Typography>
            </ListItem>
            <ListItem >
                <Typography className={classes.heading}>
                    Sharing Link
                </Typography>
                <Typography style={{display:"flex"}} className={classes.secondaryHeading}>
                    <CopytoClipboard author={fileData.CREATOR} id={fileData.id}/>
                </Typography>
            </ListItem>
        </List>
        <Divider light/>
      </Dialog>
    </div>
  );
}
