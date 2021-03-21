import React from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import {useSelector} from 'react-redux'
import {normalLoading} from '../../store/slices/loaderSlice'

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

export default function SimpleBackdrop() {
  const classes = useStyles();

  let loading=useSelector(normalLoading)

  return (
    <div>
      <Backdrop className={classes.backdrop} open={loading} >
        <CircularProgress size={100} color="inherit" />
      </Backdrop>
    </div>
  );
}
