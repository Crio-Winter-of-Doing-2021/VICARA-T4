import React, { useState, useEffect } from "react";
import API from "../axios";

export default function AuthorizationCheck(props) {
  let type = props.match.params.type;
  let key = props.match.params.key;

  let [success, setSuccess] = useState(null);

  useEffect(() => {
    if (type === "file") {
      API.get("/api/file/download/", {
        params: {
          id: key,
        },
      })
        .then((res) => {
          setSuccess(true);
          let link = res.data.url;
          window.open(link);
        })
        .catch((err) => {
          //console.log(err);
          setSuccess(false);
        });
    } else {
      API.get("/api/folder/download/", {
        params: {
          id: key,
        },
      })
        .then((res) => {
          setSuccess(true);
          let link = res.data.url;
          window.open(link);
        })
        .catch((err) => {
          //console.log(err);
          setSuccess(false);
        });
    }
  }, [type, key]);

  return (
    <div>
      {success === null
        ? "Checking Authorizaton..."
        : success
        ? "Access granted. Reload page to download again..."
        : "403 Access Denied"}
    </div>
  );
}
