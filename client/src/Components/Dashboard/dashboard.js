import React from 'react'
import DashUtil from './dashboardUitl'
import { Route, Redirect, Switch } from "react-router-dom";
import Favourite from "../Favourite/";
import Structure from "../Structure/structure";

export default function Dashboard() {
  return (
    <div>
      <DashUtil>
            <Switch>
              <Route
                path="/"
                exact
                component={() => <Redirect to="/drive/ROOT" />}
              />
              <Route path="/drive/:id" component={Structure} />
              <Route path="/favourites" component={Favourite} />
              <Route path="*">
                <div>404 not found</div>
              </Route>
            </Switch>
      </DashUtil>
    </div>
  )
}
