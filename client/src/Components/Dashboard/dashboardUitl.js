import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
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
// import InboxIcon from "@material-ui/icons/MoveToInbox";
// import MailIcon from "@material-ui/icons/Mail";
import Button from "@material-ui/core/Button";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { sideNav } from "../../constants";

import { Link } from "react-router-dom";

import { emptykeys } from "../../store/slices/checkBoxSlice";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

import Profile from "../Profile/profile";
import { Copyright } from "../Forms/login";
import { getProfileAsync } from "../../store/slices/authSlice";
import { asyncLocalStorage } from "../../Utilities/localStoreAsync";
import { setCurrentPage } from "../../store/slices/loaderSlice";
import { getFolderPickerView, pathAsync } from "../../store/slices/moveSlice";

import Search from "./search";
import { resetSelection } from "../../store/slices/structureSlice";

const drawerWidth = 280;

const theme = createMuiTheme({
  typography: {
    fontFamily: "Nunito",
  },
  palette: {
    primary: {
      main: "#1e2022",
    },
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

  const dispatch = useDispatch();

  const handlePageChange = (e, data) => {
    //console.log(data);
    dispatch(emptykeys());
  };

  // let id = window.localStorage.getItem("id");
  const [id, setId] = React.useState(null);

  useEffect(() => {
    asyncLocalStorage.getItem("id").then((res) => {
      dispatch(getProfileAsync(res));
      setId(res);
    });

    dispatch(getFolderPickerView("ROOT"));
    dispatch(pathAsync({ id: "ROOT", type: "FOLDER" }));
    // dispatch(getProfileAsync(id));
  }, [dispatch, id]);

  const handleLogout = () => {
    window.localStorage.removeItem("access_token");
    window.localStorage.removeItem("id");
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "0 20px",
              }}
            >
              <Typography style={{ fontWeight: "bold" }} variant="h6">
                Vicara-T4
              </Typography>
              <Search />
              <Link
                style={{ textDecoration: "none", color: "white" }}
                to="/login"
              >
                <Button
                  onClick={handleLogout}
                  startIcon={<ExitToAppIcon />}
                  style={{ fontWeight: "bold" }}
                  color="inherit"
                >
                  Logout
                </Button>
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
          <Profile />
          <Divider />
          <div className={classes.drawerContainer}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <List>
                {sideNav.map((data, index) => (
                  <Link
                    style={{ textDecoration: "none" }}
                    onClick={() => {
                      dispatch(setCurrentPage(data.name));
                      dispatch(resetSelection());
                    }}
                    to={
                      data.name === "Home"
                        ? `/drive/${id}`
                        : data.name === "Shared with Me"
                        ? `/shared-with-me`
                        : `/${data.name}`
                    }
                  >
                    <ListItem
                      button
                      onClick={(e) => handlePageChange(e, data.name)}
                      key={data.name}
                    >
                      <ListItemIcon>{data.icon}</ListItemIcon>
                      <ListItemText
                        style={{ color: "black" }}
                        primary={data.name}
                      />
                    </ListItem>
                  </Link>
                ))}
              </List>
            </div>
            <Divider />
            <div style={{ marginTop: "25px" }}>
              <Copyright />
            </div>
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
