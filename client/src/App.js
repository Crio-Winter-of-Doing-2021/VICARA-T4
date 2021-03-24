import React from "react";
import Dashboard from "./Components/Dashboard/dashboard";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";
import NormalLoader from "./Components/Loaders/normalBackdrop";
import Login from "./Components/Forms/login";
import SignUp from "./Components/Forms/signup";
import PrivateRoute from './Utilities/protectedRoute'

function App(props) {
  return (
    <div style={{ padding: "0 !important" }} className="App">
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route exact path="/signup" component={SignUp} />
        <PrivateRoute exact path="/share/:user/:key">
          <div>hello</div>
        </PrivateRoute>
        <Dashboard />
        {/* <Route path="/" component={SignUp}>
          <Dashboard />
        </Route> */}
        <NormalLoader />
      </Switch>
    </div>
  );
}

export default App;
