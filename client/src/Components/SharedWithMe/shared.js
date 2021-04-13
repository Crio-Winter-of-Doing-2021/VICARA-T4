import {
  sharedStructureAsync,
  resetChildren,
  selectChildren,
} from "../../store/slices/structureSlice";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import TableComponent from "../../Utilities/Table";

export const privOpp = 1;

export default function Structure(props) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(resetChildren());
    dispatch(sharedStructureAsync());
  }, [dispatch]);

  const children = useSelector(selectChildren);
  const tableProps = {
    privacyOptions: {
      disabled: true,
    },
    favouriteOptions: {
      show: false,
      disabled: true,
    },
    tableData: children,
    showOwner: true,
    ...props,
  };

  return (
    <div>
      <TableComponent {...tableProps} />
    </div>
  );
}
