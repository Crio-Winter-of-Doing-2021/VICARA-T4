import React from 'react'
import DashUtil from './dashboardUitl'
import { Route, Redirect, Switch } from "react-router-dom";
import Favourite from "../Favourite/fav";
import Structure from "../Structure/structure";
import PrivateRoute from "../../Utilities/protectedRoute"

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
              <PrivateRoute exact path="/drive/:id" component={Structure} />
              <PrivateRoute exact path="/favourites" component={Favourite} />
            </Switch>
      </DashUtil>
    </div>
  )
}
