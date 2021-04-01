import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Path from "../Path/path";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import Tooltip from "@material-ui/core/Tooltip";
import {
  structureAsync,
  selectStructure,
  pathAsync,
  addFavouriteAsync,
  privacyAsync,
  getFileAsync,
} from "../../store/slices/structureSlice";

import CreateFolder from "../Buttons/createFolder";
import Delete from "../Buttons/delete";
import Update from "../Buttons/update";
import Trash from "../Buttons/moveToTrash";

import UploadMenu from "../UploadMenu/index";
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

import FolderRoundedIcon from '@material-ui/icons/FolderRounded';

import Checkbox from "@material-ui/core/Checkbox";
import {
  updateSelectedKeys,
  emptykeys,
} from "../../store/slices/checkBoxSlice";

import StarBorderRoundedIcon from "@material-ui/icons/StarBorderRounded";
import StarTwoToneIcon from '@material-ui/icons/StarTwoTone';
import IconButton from "@material-ui/core/IconButton";

import { skeletonLoading } from "../../store/slices/loaderSlice";

import { typeTest } from "../../Utilities/fileType";

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: "#3a4750",
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

let loaderStructure = [1, 2, 3, 4, 5, 6, 7, 8].map((key) => {
  return (
    <StyledTableRow>
      {[1, 2, 3, 4, 5].map((el) => (
        <StyledTableCell component="th" scope="row">
          <Skeleton variant="text" />
        </StyledTableCell>
      ))}
    </StyledTableRow>
  );
});

export default function Structure(props) {
  const classes = useStyles();
  let unique_id = props.match.params.id;

  let loading = useSelector(skeletonLoading);
  const structureState = useSelector(selectStructure);

  let root_id=window.localStorage.getItem("id")

  let tableData = [];

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(structureAsync(unique_id));
    let newData = {
      id: unique_id,
      type: "FOLDER",
    };
    dispatch(pathAsync(newData));
    dispatch()
  }, [unique_id, dispatch]);

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
    };

    let typeData = {
      type: data.type,
      id: data.id,
    };

    return (
      <StyledTableRow key={data.id}>
        <StyledTableCell component="th" scope="row">
          <RightClickUtil data={typeData}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                onChange={(e) => handleCheckedChange(keyData, e)}
                inputProps={{ "aria-label": "primary checkbox" }}
              />
              {data.type === "folder" ? (
                <FolderRoundedIcon style={{color:"#67C5F0"}} />
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
                  onClick={() => dispatch(getFileAsync(data.id))}
                >
                  {data.name}
                </UILink>
              )}

              {data.favourite === true ? (
                <IconButton
                  onClick={(e) => handleFavouriteClick(e, favReverseData)}
                  style={{ margin: "0 10px" }}
                >
                  <StarTwoToneIcon style={{color:"#EDD712"}}  />
                </IconButton>
              ) : (
                <IconButton
                  onClick={(e) => handleFavouriteClick(e, favReverseData)}
                  style={{ margin: "0 10px" }}
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
          {data.last_modified}
        </StyledTableCell>

        <StyledTableCell component="th" scope="row">
          {data.privacy === true ? (
            <Tooltip title="File is Private">
              <IconButton onClick={(e) => handlePrivacy(e, privReverse)}>
                <VisibilityOffIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="File is Public">
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
          {data.created_at}
        </StyledTableCell>
        <StyledTableCell
          style={{ fontStyle: "italic", color: "grey" }}
          component="th"
          scope="row"
        >
          {data.size}
        </StyledTableCell>
      </StyledTableRow>
    );
  });

  return (
    <div>
      {console.log("loader", loading)}
      {console.log("table data", tableData)}
      <div style={{ display: "flex" }}>
      <UploadMenu parent={unique_id} />
        <CreateFolder id={unique_id} />
        <Update />
        <Trash />
        <Delete />
      </div>
      <Path {...props} />
      <TableContainer style={{ margin: "20px 10px" }} component={Paper}>
        <Table className={classes.table} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell></StyledTableCell>
              <StyledTableCell>Privacy</StyledTableCell>
              <StyledTableCell>Time Created</StyledTableCell>
              <StyledTableCell>Size</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>{loading ? loaderStructure : tableRenderer}</TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
