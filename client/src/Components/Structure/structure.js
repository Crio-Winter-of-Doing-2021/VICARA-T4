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

import UploadMenu from "../UploadMenu/index";
import TableComponent from "../../Utilities/Table";

export const privOpp = 1;
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

  return (
    <div>
      <div style={{ display: "flex" }}>
        <UploadMenu parent={unique_id} />
        <CreateFolder id={unique_id} />
      </div>
      <Path {...props} />
      <TableComponent {...tableProps} />
    </div>
  );
}
