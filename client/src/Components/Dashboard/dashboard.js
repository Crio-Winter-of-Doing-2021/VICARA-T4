import React from "react";
import DashUtil from "./dashboardUitl";
import { Route, Redirect, Switch } from "react-router-dom";
import Favourite from "../Favourite/fav";
import Structure from "../Structure/structure";
import Recent from "../Recent/recent";
import SharedWithMe from "../SharedWithMe/shared";
import Trash from "../Trash/trash";
import PrivateRoute from "../../Utilities/protectedRoute";
import FileViewModal from "../FileViewer/index";
import ReplaceModal from "../Buttons/replaceFileModal"

export default function Dashboard() {
  let id = window.localStorage.getItem("id");
  //console.log("id is",id)
  return (
    <div>
      <DashUtil>
        <FileViewModal />
        <ReplaceModal/>
        <Switch>
          <Route
            path="/"
            exact
            component={() => <Redirect to={`/drive/${id}`} />}
          />
          <PrivateRoute exact path="/drive/:id" component={Structure} />
          <PrivateRoute exact path="/favourites" component={Favourite} />
          <PrivateRoute exact path="/recent" component={Recent} />
          <PrivateRoute exact path="/trash" component={Trash} />
          <PrivateRoute exact path="/shared-with-me" component={SharedWithMe} />
          <Route path="*">
            <div
              style={{
                fontSize: "30px",
                position: "absolute",
                top: "40%",
                left: "40%",
              }}
            >
              404 not found
            </div>
          </Route>
        </Switch>
      </DashUtil>
    </div>
  );
}
