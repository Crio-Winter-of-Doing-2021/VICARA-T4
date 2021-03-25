import React from 'react';
import {useDispatch} from 'react-redux'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import EditIcon from '@material-ui/icons/Edit';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import ShareIcon from '@material-ui/icons/Share';
import { ListItemText } from '@material-ui/core';

import Share from '../Share/index'

const initialState = {
  mouseX: null,
  mouseY: null,
};

export default function ContextMenu(props) {
  const [state, setState] = React.useState(initialState);

  const handleClick = (event) => {
    event.preventDefault();
    setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleClose = () => {
    setState(initialState);
  };

  return (
    <div onContextMenu={handleClick}>
      {props.children}
      <Menu
        keepMounted
        open={state.mouseY !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          state.mouseY !== null && state.mouseX !== null
            ? { top: state.mouseY, left: state.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleClose}>
            <ListItemIcon><EditIcon color="primary"/></ListItemIcon>
            <ListItemText style={{paddingRight:"15px"}}>Rename</ListItemText>
        </MenuItem>
        {props.data.type==='FILE'?<MenuItem onClick={handleClose}>
            <ListItemIcon><ShareIcon color="primary"/></ListItemIcon>
            <Share data={props.data.id}/>
        </MenuItem>:null}
        <MenuItem onClick={handleClose}>
            <ListItemIcon><DeleteOutlineIcon color="secondary"/></ListItemIcon>
            <ListItemText style={{paddingRight:"15px"}}>Remove</ListItemText>
          
        </MenuItem>
        
      </Menu>
    </div>
  );
}
