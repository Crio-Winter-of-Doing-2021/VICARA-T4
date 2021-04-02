import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import EditIcon from "@material-ui/icons/Edit";

import {
  updateAsync,
  selectCheckedFolderKeys,
  selectCheckedFileKeys,
} from "../../store/slices/checkBoxSlice";
import { useDispatch, useSelector } from "react-redux";
// import DisabledTabs from '../File Structure/NavigationTabs/disabledTabs'

import FocusInput from "./FocusInput";
export default function FormDialog() {
  const [open, setOpen] = React.useState(false);

  const dispatch = useDispatch();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const checkedFolderKeys = useSelector(selectCheckedFolderKeys);
  const checkedFileKeys = useSelector(selectCheckedFileKeys);
  console.log({ checkedFolderKeys, checkedFileKeys });

  let nameOfSelected = "";
  if (checkedFileKeys.length !== 0) nameOfSelected = checkedFileKeys[0].name;
  if (checkedFolderKeys.length !== 0)
    nameOfSelected = checkedFolderKeys[0].name;

  console.log("name of selected = ", nameOfSelected);

  const handleClose = () => {
    setOpen(false);
  };

  const handleUpdate = (data) => {
    handleClose();

    console.log("Files", checkedFileKeys);
    console.log("Folders", checkedFolderKeys);

    let newFileData = {};
    let newFolderData = {};

    if (checkedFileKeys.length !== 0) {
      newFileData = {
        payload: {
          id: checkedFileKeys[0].id,
          name: data,
        },
        index: checkedFileKeys[0].index,
      };
    }

    if (checkedFolderKeys.length !== 0) {
      newFolderData = {
        payload: {
          id: checkedFolderKeys[0].id,
          name: data,
        },
        index: checkedFolderKeys[0].index,
      };
    }

    dispatch(updateAsync(newFileData, newFolderData));
  };

  let deactive =
    checkedFolderKeys.length + checkedFileKeys.length !== 1 ? true : false;

  return (
    <div style={{ margin: "10px" }}>
      <Button
        startIcon={<EditIcon />}
        disabled={deactive}
        variant="outlined"
        color="primary"
        onClick={handleClickOpen}
      >
        Update
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        fullWidth
      >
        <FocusInput
          nameOfSelected={nameOfSelected}
          handleClose={handleClose}
          handleUpdate={handleUpdate}
        />
      </Dialog>
    </div>
  );
}
