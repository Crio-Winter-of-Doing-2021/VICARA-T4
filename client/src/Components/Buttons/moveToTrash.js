import React from "react";
// import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
// import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import DeleteIcon from "@material-ui/icons/Delete";
import {
  selectCheckedFolderKeys,
  selectCheckedFileKeys,
  trashAsync,
} from "../../store/slices/checkBoxSlice";
import { useDispatch, useSelector } from "react-redux";
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';

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

  let trashSelected = (fileData, folderData) => {
    dispatch(trashAsync(fileData, folderData));
  };

  let deactive =
    checkedFileKeys.length + checkedFolderKeys.length !== 0 ? false : true;

  return (
    <div style={{ margin: "10px" }}>
      <Button
        disabled={deactive}
        startIcon={<DeleteSweepIcon />}
        onClick={() => trashSelected(checkedFileKeys, checkedFolderKeys)}
        variant="outlined"
      >
        Move To Trash
      </Button>
    </div>
  );
}
