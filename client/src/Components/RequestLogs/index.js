import React from 'react';
import {useSelector,useDispatch} from 'react-redux'
// import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

import {selectLogs,defaultLog} from '../../store/slices/logSlice'


function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

export default function CustomizedSnackbars() {
  const classes = useStyles();

  let data=useSelector(selectLogs)
  const dispatch=useDispatch()
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(defaultLog())
  };

  return (
    <div className={classes.root}>
      <Snackbar autoHideDuration={5000} open={data.show} onClose={handleClose}>
        <Alert onClose={handleClose} severity={data.type}>
          {data.feed}
        </Alert>
      </Snackbar>
    </div>
  );
}
