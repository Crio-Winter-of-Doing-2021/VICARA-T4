import React from "react";
// import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
// import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import DeleteIcon from "@material-ui/icons/Delete";
import {
  selectCheckedFolderKeys,
  selectCheckedFileKeys,
  deleteAsync,
} from "../../store/slices/checkBoxSlice";
import { useDispatch, useSelector } from "react-redux";

// const useStyles = makeStyles((theme) => ({
//   root: {
//     "& > *": {
//       margin: theme.spacing(1),
//     },
//   },
// }));

export default function OutlinedButtons() {
  // const classes = useStyles();

  let checkedFolderKeys = useSelector(selectCheckedFolderKeys);
  let checkedFileKeys = useSelector(selectCheckedFileKeys);
  const dispatch = useDispatch();

  let deleteSelected = (fileData, folderData) => {
    dispatch(deleteAsync(fileData, folderData));
  };

  let deactive =
    checkedFileKeys.length + checkedFolderKeys.length !== 0 ? false : true;

  return (
    <div style={{ margin: "10px" }}>
      <Button
        disabled={deactive}
        startIcon={<DeleteIcon />}
        onClick={() => deleteSelected(checkedFileKeys, checkedFolderKeys)}
        variant="outlined"
        color="secondary"
      >
        Delete
      </Button>
    </div>
  );
}
