import React from "react";
import { useSelector } from "react-redux";
import { emphasize, withStyles } from "@material-ui/core/styles";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Chip from "@material-ui/core/Chip";
import HomeIcon from "@material-ui/icons/Home";
// import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FolderIcon from "@material-ui/icons/Folder";

import { navStructure } from "../../store/slices/structureSlice";

const StyledBreadcrumb = withStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.grey[100],
    height: theme.spacing(3),
    color: theme.palette.grey[800],
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: theme.palette.grey[300],
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(theme.palette.grey[300], 0.12),
    },
  },
}))(Chip); // TypeScript only: need a type cast here because https://github.com/Microsoft/TypeScript/issues/26591

export default function CustomizedBreadcrumbs(props) {
  // const dispatch = useDispatch();
  let nav = [];
  nav = useSelector(navStructure);

  let updateFolder = (e, key) => {
    e.preventDefault();
    //console.log("key called", key);
    props.history.push(`/drive/${key}`);
  };

  let renderNav = nav.map((data) => {
    return (
      <StyledBreadcrumb
        key={data.id}
        component="a"
        href="#"
        label={data.name}
        icon={
          data.id === "ROOT" ? (
            <HomeIcon fontSize="small" />
          ) : (
            <FolderIcon fontSize="small" />
          )
        }
        onClick={(e) => updateFolder(e, data.id)}
      />
    );
  });

  return (
    <Breadcrumbs style={{ margin: "10px" }} aria-label="breadcrumb">
      {renderNav}
    </Breadcrumbs>
  );
}
