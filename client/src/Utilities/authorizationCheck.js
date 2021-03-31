import React, { useState, useEffect } from "react";
import API from "../axios";

export default function AuthorizationCheck(props) {
  let author = props.match.params.user;
  let key = props.match.params.key;

  let [success, setSuccess] = useState(null);

  useEffect(() => {
    API.get("/api/share/", {
      params: {
        id: key,
        CREATOR: author,
      },
    })
      .then((res) => {
        setSuccess(true);
        let link = res.data.URL;
        window.open(link);
      })
      .catch((err) => {
        console.log(err);
        setSuccess(false);
      });
  }, [author, key]);

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
