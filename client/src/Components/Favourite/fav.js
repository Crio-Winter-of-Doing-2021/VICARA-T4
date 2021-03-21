import React, { useEffect,Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import Path from "../Path/path";
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import Tooltip from '@material-ui/core/Tooltip';
import {pathParse} from '../../Utilities/pathParser'

import {
  favStructureAsync,
  selectFavStructure,
  pathAsync,
  addFavouriteAsync,
  privacyAsync
} from "../../store/slices/favSlice"

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
import {default as UILink} from "@material-ui/core/Link";

import {Link} from 'react-router-dom'

import DescriptionTwoToneIcon from "@material-ui/icons/DescriptionTwoTone";
import FolderOpenTwoToneIcon from "@material-ui/icons/FolderOpenTwoTone";

import Checkbox from "@material-ui/core/Checkbox";
import {
  updateSelectedKeys,
  selectCheckedKeys,
  emptykeys,
} from "../../store/slices/checkBoxSlice";

import StarBorderRoundedIcon from "@material-ui/icons/StarBorderRounded";
import StarRoundedIcon from "@material-ui/icons/StarRounded";
import RemoveIcon from '@material-ui/icons/Remove';
import IconButton from "@material-ui/core/IconButton";

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

  const structureState = useSelector(selectFavStructure);
  console.log(structureState);
  //   const selectedKeys=useSelector(selectCheckedKeys)

  let tableData = [];

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(favStructureAsync());
  }, []);

  Object.keys(structureState).map((key, index) => {
    let newData = {
      key: key,
      type: structureState[key].TYPE,
      name: structureState[key].NAME,
      favourite: structureState[key].FAVOURITE,
      privacy:structureState[key].PRIVACY,
      path:"Loading..."
    };
    tableData.push(newData);
  });

  let updateFolder = (key) => {
    console.log("key clicked", key);
    props.history.push(`/drive/${key}`);
    // dispatch(structureAsync(key))
    dispatch(emptykeys());
  };

  const [checked, setChecked] = React.useState(true);

  const handleCheckedChange = (key, e) => {
    console.log("checked");
    dispatch(updateSelectedKeys(key));
  };

  const handleFavouriteClick = (e, data) => {
    e.preventDefault();
    console.log(data);
    dispatch(addFavouriteAsync(data));
  };

  const handlePrivacy = (e,data)=>{
    e.preventDefault();
    dispatch(privacyAsync(data))

  }

  let privOpp =(privacy)=>{
    if(privacy==="PUBLIC") return "PRIVATE";
    return "PUBLIC"
  }

  console.log(tableData)

  let tableRenderer = tableData.map((data) => {

    let favReverseData = {
      id: data.key,
      is_favourite: !data.favourite,
    };



    let privReverse={
      id:data.key,
      PRIVACY:privOpp(data.privacy)
    }

    let keyData={
      id:data.key,
      type:data.type
    }

    console.log(data.privacy)

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

            {data.type==="FOLDER"?<UILink
              component="button"
              variant="body2"
              style={{ marginLeft: "5px" }}
              onClick={() => {updateFolder(data.key)}}
            >
              {data.name}
            </UILink>:<Link
              target="_blank"
              to='/favourites'
            >
              {data.name}
            </Link>}

            {data.favourite === true ? (
              <IconButton
                onClick={(e) => handleFavouriteClick(e, favReverseData)}
                style={{ margin: "0 10px" }}
                color="primary"
              >
                <StarRoundedIcon />
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
        </StyledTableCell>
        <StyledTableCell>
              {data.path}
        </StyledTableCell>
        <StyledTableCell component="th" scope="row">
          {data.privacy===undefined?<Tooltip title="Privacy cannot be set for folders">
            <IconButton><RemoveIcon/></IconButton>
          </Tooltip>:data.privacy==='PRIVATE'?
          <Tooltip title="File is Private">
            <IconButton
              onClick={(e) => handlePrivacy(e, privReverse)}
            ><VisibilityOffIcon/></IconButton>
          </Tooltip>:
          <Tooltip title="File is Public">
            <IconButton 
            onClick={(e) => handlePrivacy(e, privReverse)}
            color="primary"><VisibilityIcon/></IconButton>
          </Tooltip>}
        </StyledTableCell>
      </StyledTableRow>
    );
  });

  return (
    <div>
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
              <StyledTableCell>Privacy</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>{tableRenderer}</TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
