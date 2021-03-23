import React from "react";
import Dashboard from "./Components/Dashboard/dashboard";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";
import NormalLoader from "./Components/Loaders/normalBackdrop";
import Login from "./Components/Forms/login";
import SignUp from "./Components/Forms/signup";


function App(props) {
  return (
    <div style={{ padding: "0 !important" }} className="App">
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={SignUp} />
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
