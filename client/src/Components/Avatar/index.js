import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles} from '@material-ui/core/styles';
import MaleUser from '../../assets/elliot.jpg'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent:"center",
    '& > *': {
      margin: theme.spacing(1),
    }
  },
}));

export default function BadgeAvatars(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
        <Avatar alt="Remy Sharp" style={{width:"100px",height:"100px"}} src={MaleUser} />
    </div>
  );
}
