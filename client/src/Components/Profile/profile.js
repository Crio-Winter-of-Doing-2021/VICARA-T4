import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import UserImage from "../Avatar/index";
import { Divider, Typography } from "@material-ui/core";
import { selectUserData } from "../../store/slices/authSlice";
import { profileLoading, pictureLoading } from "../../store/slices/loaderSlice";
import Skeleton from "@material-ui/lab/Skeleton";
import LinearProgress from "@material-ui/core/LinearProgress";
import { withStyles } from "@material-ui/core/styles";
let progress = 0;

const BorderLinearProgress = withStyles((theme) => ({
  root: {
    height: 10,
    borderRadius: 5,
  },
  colorPrimary: {
    backgroundColor:
      theme.palette.grey[theme.palette.type === "light" ? 200 : 700],
  },
  bar: {
    borderRadius: 5,
    backgroundColor:
      progress <= 50
        ? "#1a90ff"
        : progress > 50 && progress <= 75
        ? "#F5A027"
        : "#F64225",
  },
}))(LinearProgress);

export default function Profile() {
  let userData = useSelector(selectUserData);
  let loading = useSelector(profileLoading);

  let pictureUpdating = useSelector(pictureLoading);

  if (userData.storage_data !== undefined) {
    progress = userData.storage_data.ratio * 100;
  }

  return (
    <div style={{ margin: "15px 0" }}>
      {loading === false ? (
        <Fragment>
          {pictureUpdating ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Skeleton variant="circle" width={100} height={100} />
            </div>
          ) : (
            <UserImage />
          )}
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Typography style={{ color: "grey", fontStyle: "italic" }}>
              @{userData.username}
            </Typography>
          </div>
          <div
            style={{
              display: "flex",
              marginBottom: "10px",
              justifyContent: "center",
            }}
          >
            <Typography>
              {userData.username === undefined
                ? "Fetching profile..."
                : `${userData.first_name} ${userData.last_name}`}
            </Typography>
          </div>
          <Divider />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "20px 0 10px",
            }}
          >
            <Typography>Storage Data:</Typography>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <BorderLinearProgress
              style={{ width: "85%" }}
              variant="determinate"
              value={progress}
            />
          </div>
          <div
            style={{ display: "flex", justifyContent: "center", color: "grey" }}
          >
            {userData.storage_data !== undefined
              ? userData.storage_data.readable
              : "Calculating..."}
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Skeleton variant="circle" width={100} height={100} />
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Skeleton width={80} variant="text" />
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Skeleton width={120} variant="text" />
          </div>
          <Divider />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "20px 0 10px",
            }}
          >
            <Skeleton width={80} variant="text" />
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Skeleton width={120} variant="text" />
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Skeleton width={60} variant="text" />
          </div>
        </Fragment>
      )}
    </div>
  );
}
