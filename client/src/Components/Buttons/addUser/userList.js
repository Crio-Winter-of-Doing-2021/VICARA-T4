import React from 'react';
import {useSelector,useDispatch} from 'react-redux'
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Checkbox from '@material-ui/core/Checkbox';
import Avatar from '@material-ui/core/Avatar';
import {selectUsers,selectFileData,updatePatchUsers} from '../../../store/slices/shareSlice'
import { deepOrange, deepPurple } from '@material-ui/core/colors';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: theme.palette.background.paper,
  },
  orange: {
    color: theme.palette.getContrastText(deepOrange[500]),
    backgroundColor: deepOrange[500],
  },
  text:{
      margin:"0 10px",
      fontWeight:"bold",
      fontSize:"10px"
  }
}));


export default function CheckboxListSecondary(props) {
  const classes = useStyles();
 
  const dispatch=useDispatch();

  let userList=[];

  userList=useSelector(selectUsers);
  let fileData=useSelector(selectFileData)
  let selectedUsers=fileData.USERS

  let author=props.author
  

  let renderUsers=userList.map(user=>{
    
    let checked=false;
    function check(userListItem) {
        return user.username === userListItem|user.username===author;
      }
    
    let index=selectedUsers.findIndex(check);

    if(index!==-1){
        checked=true
    }

    if(user.username===author) checked=true

    return (
        checked?<ListItem key={user.username} button>
        <ListItemAvatar >
          <Avatar className={classes.orange}>A</Avatar>
        </ListItemAvatar>
        <ListItemText className={classes.text} primary={`${user.username}`} />
        <ListItemSecondaryAction>
          <Checkbox
            checked={checked}
            disabled={checked}
            edge="end"
          />
        </ListItemSecondaryAction>
      </ListItem>:<ListItem key={user} button>
        <ListItemAvatar >
          <Avatar className={classes.orange}>A</Avatar>
        </ListItemAvatar>
        <ListItemText className={classes.text} primary={`${user.username}`} />
        <ListItemSecondaryAction>
          <Checkbox
            edge="end"
            onChange={()=>dispatch(updatePatchUsers(user.username))}
          />
        </ListItemSecondaryAction>
      </ListItem>
      );
  })

  return (
    <List dense className={classes.root}>
      {renderUsers}
    </List>
  );
}
