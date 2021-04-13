import React from "react";
import { useDispatch, useSelector } from "react-redux";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import Tooltip from "@material-ui/core/Tooltip";
import {
  updateChildAsync,
  updateSelection,
  resetSelection,
  selectOrderBy,
  setOrderBy,
} from "../../store/slices/structureSlice";

import EmptyFolderPic from "../../assets/rest.png";

import { downloadOrViewFile } from "../../store/slices/fileViewSlice";

import Skeleton from "@material-ui/lab/Skeleton";

import Checkbox from "@material-ui/core/Checkbox";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { default as UILink } from "@material-ui/core/Link";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import RightClickUtil from "../../Components/RightClickMenu/rightClickUtil";

import FolderRoundedIcon from "@material-ui/icons/FolderRounded";

import { emptykeys } from "../../store/slices/checkBoxSlice";

import StarBorderRoundedIcon from "@material-ui/icons/StarBorderRounded";
import StarTwoToneIcon from "@material-ui/icons/StarTwoTone";
import IconButton from "@material-ui/core/IconButton";

import { skeletonLoading } from "../../store/slices/loaderSlice";

import { typeTest } from "../fileType";
import SortIcon from "@material-ui/icons/Sort";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";

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

export default function TableComponent({
  privacyOptions,
  favouriteOptions,
  tableData,
  showOwner,
  ...props
}) {
  const classes = useStyles();

  let loading = useSelector(skeletonLoading);

  // let tableData = [];
  const dispatch = useDispatch();

  const compareByName = (a, b) => {
    return a.name > b.name;
  };

  const compareByLastModified = (a, b) => {
    return a.last_modified_ms < b.last_modified_ms;
  };
  const orderBy = useSelector(selectOrderBy);
  if (orderBy === "last_modified") {
    tableData.sort(compareByLastModified);
  } else {
    tableData.sort(compareByName);
  }

  const tableRenderer = tableData.map((data, index) => {
    const {
      privacy,
      favourite,
      id,
      name,
      type,
      last_modified,
      size,
      created_at,
      owner,
      selected,
    } = data;
    const state_id = `${type}_${id}`;

    return (
      <TableRow
        onDoubleClick={(e) => {
          if (type === "folder") {
            props.history.push(`/drive/${id}`);
          }
        }}
        key={state_id}
        selected={selected}
      >
        {nameAndFavouriteCell({
          data,
          name,
          selected,
          id,
          favourite,
          type,
          favouriteOptions,
          props,
        })(dispatch)}
        {ownerCell({ owner, showOwner, data })}
        {lastModifiedCell({ last_modified, data })}
        {privacyCell({ privacy, id, type, privacyOptions, data })(dispatch)}
        {createdAtCell({ created_at, data })}
        {sizeCell({ size, data })}
      </TableRow>
    );
  });

  return (
    <div>
      <TableContainer style={{ margin: "20px 10px" }} component={Paper}>
        <Table className={classes.table} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>
                Name
                <IconButton
                  onClick={() => dispatch(setOrderBy("name"))}
                  size="small"
                  style={{ margin: "0 20px", color: "white" }}
                >
                  <SortIcon />
                </IconButton>
              </StyledTableCell>
              {showOwner ? <StyledTableCell>Owner</StyledTableCell> : null}
              <StyledTableCell></StyledTableCell>
              <StyledTableCell>Privacy</StyledTableCell>
              <StyledTableCell>
                Time Created
                <IconButton
                  onClick={() => dispatch(setOrderBy("last_modified"))}
                  size="small"
                  style={{ color: "white", margin: "2px" }}
                >
                  <ArrowDownwardIcon />
                </IconButton>
              </StyledTableCell>
              <StyledTableCell>Size</StyledTableCell>
            </TableRow>
          </TableHead>
          <ClickAwayListener onClickAway={() => dispatch(resetSelection())}>
            <TableBody>{loading ? loaderStructure : tableRenderer}</TableBody>
          </ClickAwayListener>
        </Table>
      </TableContainer>
      {!loading && tableRenderer.length === 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            height: "60vh",
            alignItems: "center",
          }}
        >
          <img style={{ width: "30%" }} alt="empty" src={EmptyFolderPic} />
        </div>
      ) : null}
    </div>
  );
}

//                                              Cell Functions

const sizeCell = ({ size, data }) => {
  return (
    <StyledTableCell
      style={{ fontStyle: "italic", color: "grey" }}
      component="th"
      scope="row"
    >
      <RightClickUtil data={data}>{size}</RightClickUtil>
    </StyledTableCell>
  );
};
const ownerCell = ({ owner, showOwner, data }) => {
  if (!showOwner) return null;
  return (
    <StyledTableCell
      style={{ fontStyle: "italic", color: "grey" }}
      component="th"
      scope="row"
    >
      <RightClickUtil data={data}>{owner.username}</RightClickUtil>
    </StyledTableCell>
  );
};
const createdAtCell = ({ created_at, data }) => {
  return (
    <StyledTableCell
      style={{ fontStyle: "italic", color: "grey" }}
      component="th"
      scope="row"
    >
      <RightClickUtil data={data}>{created_at}</RightClickUtil>
    </StyledTableCell>
  );
};

const privacyCell = ({ privacy, id, type, privacyOptions, data }) => (
  dispatch
) => {
  const { disabled } = privacyOptions;

  return (
    <StyledTableCell component="th" scope="row">
      <RightClickUtil data={data}>
        {privacy === true ? (
          <Tooltip title="Private Resource">
            <IconButton
              disabled={disabled}
              onClick={(e) =>
                dispatch(updateChildAsync({ privacy: !privacy, id, type }))
              }
            >
              <VisibilityOffIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Publicly Accessible">
            <IconButton
              disabled={disabled}
              onClick={(e) =>
                dispatch(updateChildAsync({ type, id, privacy: !privacy }))
              }
              color="primary"
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        )}
      </RightClickUtil>
    </StyledTableCell>
  );
};

const lastModifiedCell = ({ last_modified, data }) => {
  return (
    <StyledTableCell
      style={{ fontStyle: "italic", color: "grey" }}
      component="th"
      scope="row"
    >
      <RightClickUtil data={data}>
        <RightClickUtil data={data}>{last_modified}</RightClickUtil>
      </RightClickUtil>
    </StyledTableCell>
  );
};

const renderFavourite = ({ favourite, id, type, disabled }) => (dispatch) => {
  // //console.log("244", { id, type });
  return (
    <>
      {favourite === true ? (
        <IconButton
          disabled={disabled}
          onClick={(e) =>
            dispatch(
              updateChildAsync({
                id,
                type,
                favourite: !favourite,
              })
            )
          }
          style={{ margin: "0 10px" }}
        >
          <StarTwoToneIcon style={{ color: "#EDD712" }} />
        </IconButton>
      ) : (
        <IconButton
          disabled={disabled}
          onClick={(e) =>
            dispatch(
              updateChildAsync({
                id,
                type,
                favourite: !favourite,
              })
            )
          }
          style={{ margin: "0 10px" }}
        >
          <StarBorderRoundedIcon />
        </IconButton>
      )}
    </>
  );
};
const nameAndFavouriteCell = ({
  data,
  name,
  id,
  favourite,
  type,
  favouriteOptions,
  props,
  selected,
}) => (dispatch) => {
  const updateFolder = (key) => {
    //console.log("key clicked", key);
    props.history.push(`/drive/${key}`);
    dispatch(emptykeys());
  };

  const { show, disabled } = favouriteOptions;

  // //console.log("301", { id, type });
  return (
    <StyledTableCell component="th" scope="row">
      <RightClickUtil data={data}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Checkbox
            onChange={(e) =>
              dispatch(updateSelection({ selected: !selected, id, type }))
            }
            inputProps={{ "aria-label": "primary checkbox" }}
            checked={selected}
          />
          {type === "folder" ? (
            <FolderRoundedIcon style={{ color: "#67C5F0" }} />
          ) : (
            typeTest(name)
          )}

          {type === "folder" ? (
            <UILink
              component="button"
              variant="body2"
              style={{ marginLeft: "5px" }}
              onClick={() => {
                updateFolder(id);
              }}
            >
              {name}
            </UILink>
          ) : (
            <UILink
              component="button"
              variant="body2"
              style={{ marginLeft: "5px" }}
              onClick={() => dispatch(downloadOrViewFile({ name, id }))}
            >
              {name}
            </UILink>
          )}
          {show
            ? renderFavourite({ favourite, id, type, disabled })(dispatch)
            : null}
        </div>
      </RightClickUtil>
    </StyledTableCell>
  );
};
