import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import Path from "../Path/path";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import Tooltip from "@material-ui/core/Tooltip";

import {
  favStructureAsync,
  selectFavStructure,
  addFavouriteAsync,
  privacyAsync,
} from "../../store/slices/favSlice";

import Delete from "../Buttons/delete";
import Update from "../Buttons/update";

import Skeleton from "@material-ui/lab/Skeleton";

import { withStyles, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { default as UILink } from "@material-ui/core/Link";

import RightClickUtil from "../RightClickMenu/rightClickUtil";

import FolderRoundedIcon from "@material-ui/icons/FolderRounded";

import Checkbox from "@material-ui/core/Checkbox";
import {
  updateSelectedKeys,
  emptykeys,
} from "../../store/slices/checkBoxSlice";

// import {getProfileAsync} from '../../store/slices/authSlice'

import StarBorderRoundedIcon from "@material-ui/icons/StarBorderRounded";
import StarTwoToneIcon from "@material-ui/icons/StarTwoTone";
import IconButton from "@material-ui/core/IconButton";

import { skeletonLoading } from "../../store/slices/loaderSlice";

import { typeTest } from "../../Utilities/fileType";

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const useStyles = makeStyles({
  table: {
    minWidth: 700,
  },
});

export let privOpp = (privacy) => {
  if (privacy === "PUBLIC") return "PRIVATE";
  return "PUBLIC";
};

let loaderStructure = [1, 2, 3, 4, 5, 6.7, 8].map((key) => {
  return (
    <StyledTableRow>
      {[1, 2, 3, 4].map((el) => (
        <StyledTableCell component="th" scope="row">
          <Skeleton variant="text" />
        </StyledTableCell>
      ))}
    </StyledTableRow>
  );
});

export default function Structure(props) {
  const classes = useStyles();
  let loading = useSelector(skeletonLoading);
  const structureState = useSelector(selectFavStructure);

  let root_id = window.localStorage.getItem("id");

  let tableData = [];

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(favStructureAsync());
    // dispatch(getProfileAsync(root_id))
  }, [dispatch, root_id]);

  tableData = structureState;

  let updateFolder = (key) => {
    console.log("key clicked", key);
    props.history.push(`/drive/${key}`);
    dispatch(emptykeys());
  };

  const handleCheckedChange = (key, e) => {
    console.log("checked");
    dispatch(updateSelectedKeys(key));
  };

  const handleFavouriteClick = (e, data) => {
    e.preventDefault();
    console.log(data);
    dispatch(addFavouriteAsync(data));
  };

  const handlePrivacy = (e, data) => {
    e.preventDefault();
    dispatch(privacyAsync(data));
  };

  let tableRenderer = tableData.map((data, index) => {
    let favReverseData = {
      payload: {
        id: data.id,
        favourite: !data.favourite,
      },
      type: data.type,
      key: index,
    };

    let privReverse = {
      payload: {
        id: data.id,
        privacy: !data.privacy,
      },
      type: data.type,
      key: index,
    };

    let keyData = {
      id: data.id,
      type: data.type,
      index: index,
      name: data.name,
    };

    let typeData = {
      type: data.type,
      id: data.id,
    };

    return (
      <StyledTableRow key={data.id}>
        <StyledTableCell component="th" scope="row">
          <RightClickUtil index={index} data={data}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                onChange={(e) => handleCheckedChange(keyData, e)}
                inputProps={{ "aria-label": "primary checkbox" }}
              />
              {data.type === "folder" ? (
                <FolderRoundedIcon style={{ color: "#67C5F0" }}/>
              ) : (
                typeTest(data.name)
              )}

              {data.type === "folder" ? (
                <UILink
                  component="button"
                  variant="body2"
                  style={{ marginLeft: "5px" }}
                  onClick={() => {
                    updateFolder(data.id);
                  }}
                >
                  {data.name}
                </UILink>
              ) : (
                <UILink
                  component="button"
                  variant="body2"
                  style={{ marginLeft: "5px" }}
                  onClick={() => {
                    console.log("clicked");
                  }}
                >
                  {data.name}
                </UILink>
              )}

              {data.favourite === true ? (
                <IconButton
                  onClick={(e) => handleFavouriteClick(e, favReverseData)}
                  style={{ margin: "0 10px" }}
                  color="primary"
                >
                  <StarTwoToneIcon style={{ color: "#EDD712" }} />
                </IconButton>
              ) : (
                <IconButton
                  onClick={(e) => handleFavouriteClick(e, favReverseData)}
                  style={{ margin: "0 10px" }}
                  color="primary"
                >
                  <StarBorderRoundedIcon />
                </IconButton>
              )}
            </div>
          </RightClickUtil>
        </StyledTableCell>

        <StyledTableCell
          style={{ fontStyle: "italic", color: "grey" }}
          component="th"
          scope="row"
        >
          {data.size}
        </StyledTableCell>

        <StyledTableCell component="th" scope="row">
          {data.privacy === true ? (
            <Tooltip title="Private Resource">
              <IconButton onClick={(e) => handlePrivacy(e, privReverse)}>
                <VisibilityOffIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Publicly Accessible">
              <IconButton
                onClick={(e) => handlePrivacy(e, privReverse)}
                color="primary"
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          )}
        </StyledTableCell>
        <StyledTableCell
          style={{ fontStyle: "italic", color: "grey" }}
          component="th"
          scope="row"
        >
          {data.last_modified}
        </StyledTableCell>
      </StyledTableRow>
    );
  });

  return (
    <div>
      {console.log("loader", loading)}
      {console.log("table data", tableData)}
      <div style={{ display: "flex" }}>
        <Delete />
        <Update />
      </div>
      <TableContainer style={{ margin: "20px 10px" }} component={Paper}>
        <Table className={classes.table} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>File Size</StyledTableCell>
              <StyledTableCell>Privacy</StyledTableCell>
              <StyledTableCell>Last Visited</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>{loading ? loaderStructure : tableRenderer}</TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
