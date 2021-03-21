import React, { useEffect, useState} from 'react';
import { Route, Redirect } from 'react-router-dom'
import { useSelector } from "react-redux";

const PrivateRoute = ({ component: Component, ...rest }) => {
  let [isAuthenticated, setIsAuthenticated] = useState(null)  
  useEffect(() => {
    let token = window.localStorage.getItem('session')
    if(token===null) setIsAuthenticated(false);
    else setIsAuthenticated(true)
    // eslint-disable-next-line
  }, [])

  if(isAuthenticated === null){
    return <></>
  }

  return (
    <Route {...rest} render={props =>
      !isAuthenticated ? (
        <Redirect to='/login'/>
      ) : (
        <Component {...props} />
      )
    }
    />
  );
};

export default PrivateRoute;
