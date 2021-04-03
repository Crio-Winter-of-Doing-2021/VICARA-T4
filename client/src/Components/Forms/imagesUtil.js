import React from "react";
import Avatar from "@material-ui/core/Avatar";
import { makeStyles } from "@material-ui/core/styles";

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
  const classes = useStyles();

  return (
    <div className={classes.root}>
      
        <Avatar
          alt={props.name}
          style={{ width: "125px", height: "125px" }}
          src={props.pic}
        />
    </div>
  );
}
