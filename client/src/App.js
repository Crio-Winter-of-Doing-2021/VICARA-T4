import React from "react";
import Dashboard from "./Components/Dashboard/dashboard";
import { Route, Switch } from "react-router-dom";
import NormalLoader from "./Components/Loaders/normalBackdrop";
import Login from "./Components/Forms/login";
import SignUp from "./Components/Forms/signup";
import PrivateRoute from "./Utilities/protectedRoute";
import AuthorizationCheck from "./Utilities/authorizationCheck";
import Message from "./Components/RequestLogs/index";

function App() {
  return (
    <div style={{ padding: "0 !important" }} className="App">
      <NormalLoader />
      <Message />
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route exact path="/signup" component={SignUp} />
        <PrivateRoute exact path="/share/:type/:key" component={AuthorizationCheck} />
        <Dashboard/>
        {/* <Route path="/" component={SignUp}>
          <Dashboard />
        </Route> */}
      </Switch>
    </div>
  );
}

export default App;
