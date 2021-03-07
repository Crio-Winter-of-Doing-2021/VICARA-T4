import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NavigationTabs from "../NavigationTabs/navigation";
import {
  structureAsync,
  selectStructure,
  changeKey,
  currentStructure,
} from "../../../store/slices/structureSlice";

import AddFolder from '../../Buttons/addFolder'

import { withStyles, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Link from "@material-ui/core/Link";

import DescriptionTwoToneIcon from "@material-ui/icons/DescriptionTwoTone";
import FolderOpenTwoToneIcon from "@material-ui/icons/FolderOpenTwoTone";

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

export default function Structure() {
  const classes = useStyles();

  const structureState = useSelector(selectStructure);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(structureAsync());
  }, []);

  let tableData = [];

  Object.keys(structureState).map((key, index) => {
    let newData = {
      key: key,
      type: structureState[key].TYPE,
      name: structureState[key].NAME,
    };
    tableData.push(newData);
  });

  let updateFolder = (key) => {
    console.log("key clicked", key);
    dispatch(changeKey(key));
    dispatch(currentStructure());
  };

  let tableRenderer = tableData.map((data) => {
    return (
      <StyledTableRow key={data.key}>
        <StyledTableCell component="th" scope="row">
          <div style={{ display: "flex", alignItems: "center" }}>
            {data.type === "FOLDER" ? (
              <FolderOpenTwoToneIcon />
            ) : (
              <DescriptionTwoToneIcon />
            )}
            <Link
              component="button"
              variant="body2"
              style={{ marginLeft: "5px" }}
              onClick={() => {
                if (data.type === "FOLDER") {
                  updateFolder(data.key);
                }
              }}
            >
              {data.name}
            </Link>
          </div>
        </StyledTableCell>
      </StyledTableRow>
    );
  });

  return (
    <div>
      <AddFolder/>
      <NavigationTabs style={{margin:"10px 0"}}/>
      <TableContainer style={{ marginTop: "20px" }} component={Paper}>
        <Table className={classes.table} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Name</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>{tableRenderer}</TableBody>
        </Table>
      </TableContainer>
      {console.log(structureState)}
    </div>
  );
}
