import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import Path from "../Path/path";

import {
  recentStructureAsync,
  selectRecentStructure,
} from "../../store/slices/recentSlice";

// import { selectStructure } from "../../store/slices/structureSlice";
import { shareAsync } from "../../store/slices/shareSlice";

// import AddFolder from "../Buttons/addFolder";
import Delete from "../Buttons/delete";
import Update from "../Buttons/update";
// import AddFile from "../Buttons/addFile";

import { withStyles, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { default as UILink } from "@material-ui/core/Link";

// import {Link} from 'react-router-dom'

import DescriptionTwoToneIcon from "@material-ui/icons/DescriptionTwoTone";
import FolderOpenTwoToneIcon from "@material-ui/icons/FolderOpenTwoTone";

import Checkbox from "@material-ui/core/Checkbox";
import {
  updateSelectedKeys,
  // selectCheckedKeys,
  emptykeys,
} from "../../store/slices/checkBoxSlice";


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

export default function Structure(props) {
  const classes = useStyles();

  const creator = window.localStorage.getItem("author");
  let structureState = useSelector(selectRecentStructure);

//   let temp = useSelector(selectStructure);

  console.log(structureState);
  //   const selectedKeys=useSelector(selectCheckedKeys)

  let tableData = [];

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(recentStructureAsync());
  }, [dispatch]);

  Object.keys(structureState).forEach((key, index) => {
    let location = "Loading";

    if (structureState[key] !== undefined) {
      location = structureState[key].PATH;
    }

    let newData = {
      key: key,
      type: structureState[key].TYPE,
      name: structureState[key].NAME,
      path: location,
      time:structureState[key].TIMESTAMP
    };
    tableData.push(newData);
  });

  let updateFolder = (key) => {
    console.log("key clicked", key);
    props.history.push(`/drive/${key}`);
    // dispatch(structureAsync(key))
    dispatch(emptykeys());
  };

  // const [checked, setChecked] = React.useState(true);

  const handleCheckedChange = (key, e) => {
    console.log("checked");
    dispatch(updateSelectedKeys(key));
  };


  console.log(tableData);

  let tableRenderer = tableData.map((data) => {

    let userDetails = {
      CREATOR: creator,
      id: data.key,
    };

    let keyData = {
      id: data.key,
      type: data.type,
    };

    return (
      <StyledTableRow key={data.key}>
        <StyledTableCell component="th" scope="row">
          <div style={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              onChange={(e) => handleCheckedChange(keyData, e)}
              inputProps={{ "aria-label": "primary checkbox" }}
            />
            {data.type === "FOLDER" ? (
              <FolderOpenTwoToneIcon />
            ) : (
              <DescriptionTwoToneIcon />
            )}

            {data.type === "FOLDER" ? (
              <UILink
                component="button"
                variant="body2"
                style={{ marginLeft: "5px" }}
                onClick={() => {
                  updateFolder(data.key);
                }}
              >
                {data.name}
              </UILink>
            ) : (
              <UILink
                component="button"
                variant="body2"
                style={{ marginLeft: "5px" }}
                onClick={() => dispatch(shareAsync(userDetails))}
              >
                {data.name}
              </UILink>
            )}
          </div>
        </StyledTableCell>
        <StyledTableCell>
          <div style={{ fontStyle: "italic", color: "grey" }}>{data.path}</div>
        </StyledTableCell>
        <StyledTableCell component="th" scope="row">
        <div style={{ fontStyle: "italic", color: "grey" }}>{data.time}</div>
        </StyledTableCell>
      </StyledTableRow>
    );
  });

  return (
    <div>
      {/* {console.log("temp", temp)} */}
      <div style={{ display: "flex" }}>
        {/* <AddFile parent={unique_id} />
        <AddFolder id={unique_id} /> */}
        <Delete />
        <Update />
      </div>
      {/* <Path {...props} /> */}
      <TableContainer style={{ marginTop: "20px" }} component={Paper}>
        <Table className={classes.table} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Location</StyledTableCell>
              <StyledTableCell>Last Visited</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>{tableRenderer}</TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
