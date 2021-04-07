import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Path from "../Path/path";
import {
  structureAsync,
  pathAsync,
  selectChildren,
  resetChildren,
} from "../../store/slices/structureSlice";

import CreateFolder from "../Buttons/createFolder";
import Delete from "../Buttons/delete";
import Update from "../Buttons/update";
import Trash from "../Buttons/moveToTrash";

import UploadMenu from "../UploadMenu/index";
import TableComponent from "../../Utilities/Table";

export const privOpp = 1;
//  privacyOptions,
//   favouriteOptions,
//   tableData,
//   showOwner,
//   ...props
export default function Structure(props) {
  let unique_id = props.match.params.id;
  const children = useSelector(selectChildren);
  let root_id = window.localStorage.getItem("id");

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(resetChildren());
    dispatch(structureAsync(unique_id));
    let newData = {
      id: unique_id,
      type: "FOLDER",
    };
    dispatch(pathAsync(newData));
  }, [unique_id, dispatch, root_id]);

  const tableProps = {
    privacyOptions: {
      disabled: false,
    },
    favouriteOptions: {
      show: true,
      disabled: false,
    },
    tableData: children,
    showOwner: false,
    ...props,
  };

  const contextMenuProps={
    download:true,
    share:true,
    trash:true,
    delete:true,
    update:true,
    restore:false
  }

  return (
    <div>
      <div style={{ display: "flex" }}>
        <UploadMenu parent={unique_id} />
        <CreateFolder id={unique_id} />
        {/* <Update /> */}
        <Trash />
        <Delete />
      </div>
      <Path {...props} />
      <TableComponent {...tableProps} />
    </div>
  );
}
