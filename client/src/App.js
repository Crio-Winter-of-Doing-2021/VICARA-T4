import React from "react";
import Dashboard from "./Components/Dashboard/dashboard";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";

function App() {
  return (
    <div style={{ padding: "0 !important" }} className="App">
      <Dashboard />
      {/* <BrowserRouter>
       <Switch>
          <Route path='/' exact component={() => <Redirect to='/drive/ROOT' />} />
          <Route path='/drive/:id' component={Dashboard} />
          <Route path='*'>
            <div>404 not found</div>
          </Route>
        </Switch> 
      </BrowserRouter> */}
    </div>
  );
}

export default App;
