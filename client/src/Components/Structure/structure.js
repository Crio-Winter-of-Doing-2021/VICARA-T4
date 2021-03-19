import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import NavigationTabs from "../NavigationTabs/navigation";

// import {Link} from 'react-router-dom'

import {
  structureAsync,
  selectStructure
} from "../../store/slices/structureSlice";

import AddFolder from '../Buttons/addFolder'
import Delete from '../Buttons/delete'
import Update from '../Buttons/update'

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

import Checkbox from '@material-ui/core/Checkbox';
import {updateSelectedKeys,selectCheckedKeys,emptykeys} from '../../store/slices/checkBoxSlice'

import StarBorderRoundedIcon from '@material-ui/icons/StarBorderRounded';
import StarRoundedIcon from '@material-ui/icons/StarRounded';
import IconButton from '@material-ui/core/IconButton';

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
  let unique_id=props.match.params.id

  const structureState = useSelector(selectStructure);
  console.log(structureState)
//   const selectedKeys=useSelector(selectCheckedKeys)

  let tableData = [];

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(structureAsync(unique_id));
  }, [unique_id]);

  

  Object.keys(structureState).map((key, index) => {
    let newData = {
      key: key,
      type: structureState[key].TYPE,
      name: structureState[key].NAME,
      favourite:structureState[key].FAVOURITE
    };
    tableData.push(newData);
  });

  let updateFolder = (key) => {
    console.log("key clicked", key);
    props.history.push(`/drive/${key}`)
    // dispatch(structureAsync(key))
    dispatch(emptykeys())
  };

  const [checked, setChecked] = React.useState(true);

  const handleCheckedChange = (key,e) => {
      console.log("checked")
      dispatch(updateSelectedKeys(key))
  };

  const handleFavouriteClick =(e,data)=>{
    e.preventDefault();
    console.log(data)
    // dispatch(addFavouriteAsync(data))
  }

  let tableRenderer = tableData.map((data) => {

    let favReverseData={
      id:data.key,
      is_favourite:!data.favourite
    }

    return (
      <StyledTableRow key={data.key}>
        <StyledTableCell component="th" scope="row">
          <div style={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              onChange={(e)=> handleCheckedChange(data.key,e)}
              inputProps={{ 'aria-label': 'primary checkbox' }}
            />
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
            {data.favourite===true?<IconButton onClick={(e)=> handleFavouriteClick(e,favReverseData)} style={{margin:"0 10px"}} color="primary">
              <StarRoundedIcon />
            </IconButton>:
            <IconButton onClick={(e)=> handleFavouriteClick(e,favReverseData)} style={{margin:"0 10px"}} color="primary">
              <StarBorderRoundedIcon />
            </IconButton>}
          </div>
        </StyledTableCell>
      </StyledTableRow>
    );
  });

  return (
    <div>
      <div style={{display:"flex"}}>
        <AddFolder id={unique_id}/>
        <Delete/>
        <Update/>
      </div>
      {/* <NavigationTabs/> */}
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
    </div>
  );
}
