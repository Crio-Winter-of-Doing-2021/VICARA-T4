import React from "react";
import Avatar from "@material-ui/core/Avatar";
import { makeStyles } from "@material-ui/core/styles";

import { selectUserData } from "../../store/slices/authSlice";
import { useSelector } from "react-redux";
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
}));

export default function BadgeAvatars(props) {
  const userData = useSelector(selectUserData);
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Avatar
        alt={userData.username}
        style={{ width: "100px", height: "100px" }}
        src={userData.profile_picture_url}
      />
    </div>
  );
}
