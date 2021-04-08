import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

import Pratik from '../../assets/pratik.jpeg'
import Panda from '../../assets/pp.jpeg'

import ImageUtil from './imagesUtil'
import GitHubIcon from '@material-ui/icons/GitHub';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import MailOutlineIcon from '@material-ui/icons/MailOutline';

import {Divider} from '@material-ui/core'

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

export default function CustomizedDialogs() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Typography onClick={handleClickOpen} style={{marginTop:"5px",cursor:'pointer'}} variant="body2" color="textSecondary" align="center">
        Contact Developers
      </Typography>
      <Dialog fullWidth onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle style={{backgroundColor:"black",color:"white"}} id="customized-dialog-title" onClose={handleClose}>
          Contact Developers
        </DialogTitle>
        <DialogContent>
          <div style={{display:"flex",justifyContent:"space-around",margin:"20px"}}>
              <div>
                <div style={{display:"flex",justifyContent:"center"}}>
                    <ImageUtil pic={Pratik} name={"Pratik Chaudhary"}/>
                </div>
                <div style={{marginBottom:"10px"}}>
                    <Typography align="center" >Pratik Chaudhary</Typography>
                </div>
                <Divider/>
                <div style={{marginTop:"10px",display:"flex",justifyContent:"space-evenly"}}>
                    <Button href="https://github.com/pratik0204" startIcon={<GitHubIcon/>}>
                       Github 
                    </Button>
                    <Button href="https://www.linkedin.com/in/pratik-chaudhary-73a77416a/" style={{color:"#0173AF"}} startIcon={<LinkedInIcon/>}>
                       LinkedIn
                    </Button>
                </div>
                <div style={{display:"flex",justifyContent:"center"}}>
                    <Button href="mailto: pchy.393@gmail.com" startIcon={<MailOutlineIcon style={{color:"#E34133"}}/>}>
                        <Typography style={{fontStyle:"italic",fontSize:"11px",color:"grey"}}> pchy.393@gmail.com</Typography>
                    </Button>
                </div>
              </div>
              <Divider orientation="vertical" />
              <div>
                  <div style={{display:"flex",justifyContent:"center"}}>
                    <ImageUtil pic={Panda} name={"Ashutosh Panda"}/>
                  </div>
                  <div style={{marginBottom:"10px"}}>
                    <Typography align="center" >Ashutosh Panda</Typography>
                </div>
                <Divider/>
                <div style={{marginTop:"10px",display:"flex",justifyContent:"space-evenly"}}>
                    <Button href="https://github.com/aashutoshPanda" startIcon={<GitHubIcon/>}>
                       Github 
                    </Button>
                    <Button href="https://www.linkedin.com/in/ashutosh-panda/" style={{color:"#0173AF"}} startIcon={<LinkedInIcon/>}>
                       LinkedIn
                    </Button>
                </div>
                <div style={{display:"flex",justifyContent:"center"}}>
                    <Button href="mailto: iamashutoshpanda@gmail.com" startIcon={<MailOutlineIcon style={{color:"#E34133"}} />}>
                        <Typography style={{fontStyle:"italic",fontSize:"11px",color:"grey"}} >iamashutoshpanda@gmail.com</Typography>
                    </Button>
                </div>
              </div>
          </div>
        </DialogContent>
        <DialogActions style={{display:"flex",justifyContent:"center"}}>
          <Typography style={{fontSize:"12px",fontStyle:"italic",color:"grey",margin:"10px"}}>*In case of any bugs or queries, contact any of the developers.</Typography>
        </DialogActions>
      </Dialog>
    </div>
  );
}
