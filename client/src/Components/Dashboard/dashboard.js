import React from 'react'
import DashUtil from './dashboardUitl'
import { Route, Redirect, Switch } from "react-router-dom";
import Favourite from "../Favourite/fav";
import Structure from "../Structure/structure";
import Recent from "../Recent/recent"
import SharedWithMe from "../SharedWithMe/shared"
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
              <PrivateRoute exact path="/recent" component={Recent} />
              <PrivateRoute exact path="/shared with me" component={SharedWithMe} />
              <Route path="*">
                <div style={{fontSize:"30px",position:"absolute",top:"40%",left:"40%"}}>
                  404 not found
                </div>
              </Route>
            </Switch>
      </DashUtil>
    </div>
  )
}
