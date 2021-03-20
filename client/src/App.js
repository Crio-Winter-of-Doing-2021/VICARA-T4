import React from "react";
import Dashboard from "./Components/Dashboard/dashboard";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";

function App() {
  return (
    <div style={{ padding: "0 !important" }} className="App">
      <Dashboard />
    </div>
  );
}

export default App;
