import React, { useEffect, useState } from "react";
import { Route, Redirect } from "react-router-dom";
// import { useSelector } from "react-redux";
import API from "../axios";
const PrivateRoute = ({ component: Component, ...rest }) => {
  let [isAuthenticated, setIsAuthenticated] = useState(null);
  useEffect(() => {
    let token = window.localStorage.getItem("access_token");
    if (token === null) setIsAuthenticated(false);
    else {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true);
    }
    // eslint-disable-next-line
  }, []);

  if (isAuthenticated === null) {
    return <></>;
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        !isAuthenticated ? <Redirect to="/login" /> : <Component {...props} />
      }
    />
  );
};

export default PrivateRoute;
