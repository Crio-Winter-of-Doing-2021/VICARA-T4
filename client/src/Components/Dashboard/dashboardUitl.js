import React from "react";
import {useDispatch} from 'react-redux'
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import MailIcon from "@material-ui/icons/Mail";
import Button from '@material-ui/core/Button';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { sideNav } from "../../constants";

import {Link} from 'react-router-dom'

import {emptykeys } from '../../store/slices/checkBoxSlice'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

const drawerWidth = 240;

const theme = createMuiTheme({
  typography: {
    fontFamily: 'Nunito'
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: "auto",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

export default function ClippedDrawer(props) {
  const classes = useStyles();

  const dispatch=useDispatch()

  const handlePageChange = (e, data) => {
    console.log(data);
    dispatch(emptykeys())
  };

  const handleLogout=()=>{
    window.localStorage.removeItem("session");
    window.localStorage.removeItem("author");
  }

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography style={{fontWeight:"bold"}} variant="h6">
            Vicara-T4
          </Typography>
          <div style={{display:"flex",justifyContent:"flex-end",width:"90%"}}>
            <Link style={{textDecoration:"none",color:"white"}} to='/login'>
              <Button onClick={handleLogout} startIcon={<ExitToAppIcon/>} style={{fontWeight:"bold"}} color="inherit">Logout</Button>
            </Link>
          </div>
          
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <Toolbar />
        <div className={classes.drawerContainer}>
          <List>
            {sideNav.map((data, index) => (
              <Link style={{textDecoration:"none"}} to={data.name==="Home"?"/drive/ROOT":`/${data.name}`}>
                <ListItem
                button
                onClick={(e) => handlePageChange(e, data.name)}
                key={data.name}
                >
                  <ListItemIcon>{data.icon}</ListItemIcon>
                  <ListItemText primary={data.name} />
                </ListItem>
              </Link>
            ))}
          </List>
          <Divider />
        </div>
      </Drawer>
      <main className={classes.content}>
        <Toolbar />
        {props.children}
      </main>
    </div>
    </ThemeProvider>
  );
}
