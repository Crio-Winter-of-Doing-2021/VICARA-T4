import { setUsersWithAccess } from "../../store/slices/shareSlice";
import { useDispatch } from "react-redux";

import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import { ListItemSecondaryAction } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: "inline",
  },
}));

export default function AlignItemsList({ show, user }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  return (
    <List
      style={{ cursor: "pointer" }}
      className={classes.root}
      onClick={() => {
        if (!show) {
          dispatch(setUsersWithAccess(user));
        }
      }}
    >
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Avatar alt={user.username} src={user.profile_picture_url} />
        </ListItemAvatar>
        <ListItemText
          style={{ marginLeft: "15px" }}
          primary={user.username}
          secondary={
            <React.Fragment>
              <Typography
                component="span"
                variant="body2"
                className={classes.inline}
                color="textPrimary"
              >
                {`${user.first_name} ${user.last_name}`}
              </Typography>
            </React.Fragment>
          }
        />

        {show ? (
          <ListItemSecondaryAction>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Typography style={{ color: "green" }}>Added</Typography>
            </div>
          </ListItemSecondaryAction>
        ) : null}
      </ListItem>
      <Divider variant="inset" component="li" />
    </List>
  );
}
