import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import DeleteIcon from '@material-ui/icons/Delete';
import {selectCheckedKeys,deleteAsync} from '../../store/slices/checkboxSlice'
import { useDispatch, useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export default function OutlinedButtons() {
  const classes = useStyles();

  const checkedKeys=useSelector(selectCheckedKeys)
  const dispatch = useDispatch()

  let deleteSelected =(data)=>{ 
    console.log(data)
    dispatch(deleteAsync(data))
  }

  let deactive= checkedKeys.length!==0?false:true;

  return (
    <div style={{margin:"0 10px"}}>
      <Button disabled={deactive} startIcon={<DeleteIcon/>} onClick={()=>deleteSelected(checkedKeys)} variant="outlined" color="secondary">
        Delete
      </Button>
    </div>
  );
}
