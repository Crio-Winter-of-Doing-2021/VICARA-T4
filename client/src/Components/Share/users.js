import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Popper from "@material-ui/core/Popper";
import Typography from "@material-ui/core/Typography";

import Fade from "@material-ui/core/Fade";
import Paper from "@material-ui/core/Paper";
import { TextField } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";

import {
  selectUsersWithAccess,
  selectSearchResults,
  searchUserAsync,
} from "../../store/slices/shareSlice";
import { searchLoading } from "../../store/slices/loaderSlice";

import UserStyleUtil from "./userUtil";

const useStyles = makeStyles((theme) => ({
  root: {
    width: 600,
    zIndex: 1500,
  },
  typography: {
    padding: theme.spacing(2),
  },
}));

export default function Users() {
  const classes = useStyles();

  const dispatch = useDispatch();
  const loading = useSelector(searchLoading);
  const usersWithAccess = useSelector(selectUsersWithAccess);
  const searchResults = useSelector(selectSearchResults);

  const userRenderer = searchResults.map((user) => {
    return (
      <UserStyleUtil
        show={usersWithAccess.hasOwnProperty(user.id)}
        user={user}
      />
    );
  });

  const [anchorEl, setAnchorEl] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const handleChange = (event) => {
    setAnchorEl(event.currentTarget);
    if (event.target.value.length !== 0) {
      setOpen(true);
      dispatch(searchUserAsync(event.target.value));
    } else {
      setOpen(false);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <TextField
        autoFocus
        margin="dense"
        id="Add"
        label="Add people to give access-"
        type=""
        onChange={handleChange}
        fullWidth
      />
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
                maxHeight: "250px",
                overflow: "auto",
                borderRadius: "20px",
              }}
            >
              <div>
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "150px",
                    }}
                  >
                    <CircularProgress />
                  </div>
                ) : (
                  <div style={{ width: "100%" }}>
                    {userRenderer.length === 0 ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "150px",
                        }}
                      >
                        <Typography
                          style={{ color: "grey", fontStyle: "italic" }}
                        >
                          No results found.
                        </Typography>
                      </div>
                    ) : (
                      userRenderer
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
