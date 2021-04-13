import React from "react";
import { useSelector, useDispatch } from "react-redux";
import InputBase from "@material-ui/core/InputBase";
import { fade, makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import Popper from "@material-ui/core/Popper";
import Paper from "@material-ui/core/Paper";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import Fade from "@material-ui/core/Fade";
import { Typography } from "@material-ui/core";

import {
  selectNavSearchResults,
  searchFileFolderAsync,
} from "../../store/slices/structureSlice";
import { navSearchLoading } from "../../store/slices/loaderSlice";

import SearchResult from "./searchResults";

const useStyles = makeStyles((theme) => ({
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1.2, 1, 1.2, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "1250px",
    [theme.breakpoints.down("lg")]: {
      width: "50ch",
    },
    [theme.breakpoints.down("md")]: {
      width: "25ch",
    },
  },
  demo: {
    backgroundColor: theme.palette.background.paper,
    width: "1250px",
    [theme.breakpoints.down("lg")]: {
      width: "70ch",
    },
    [theme.breakpoints.down("md")]: {
      width: "40ch",
    },
  },
}));

export default function Search(props) {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const dispatch = useDispatch();

  let searchResultData = useSelector(selectNavSearchResults);
  let loading = useSelector(navSearchLoading);

  const handleChange = (event) => {
    setAnchorEl(event.currentTarget);
    if (event.target.value.length !== 0) {
      setOpen(true);
      dispatch(searchFileFolderAsync(event.target.value));
    } else {
      setOpen(false);
    }
  };

  return (
    <div>
      <div className={classes.search}>
        <div className={classes.searchIcon}>
          <SearchIcon />
        </div>
        <InputBase
          placeholder="Search…"
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput,
          }}
          inputProps={{ "aria-label": "search" }}
          onChange={handleChange}
        />
      </div>
      <Popper
        className={classes.root}
        open={open}
        anchorEl={anchorEl}
        placement="bottom"
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              style={{
                marginTop: "40px",
                maxHeight: "97vh",
                overflow: "auto",
              }}
            >
              <div className={classes.demo}>
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "150px",
                      width: "100%",
                    }}
                  >
                    <CircularProgress />
                  </div>
                ) : (
                  <div style={{ width: "100%" }}>
                    {searchResultData.length === 0 ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "150px",
                          width: "100%",
                        }}
                      >
                        <Typography
                          style={{ color: "grey", fontStyle: "italic" }}
                        >
                          No results found.
                        </Typography>
                      </div>
                    ) : (
                      <div className={classes.demo}>
                        <List>
                          <SearchResult
                            viewPopper={setOpen}
                            result={searchResultData}
                          />
                        </List>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Paper>
          </Fade>
        )}
      </Popper>
    </div>
  );
}
