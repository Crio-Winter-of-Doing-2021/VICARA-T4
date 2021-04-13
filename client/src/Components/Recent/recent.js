import {
  recentStructureAsync,
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
    dispatch(recentStructureAsync());
  }, [dispatch]);

  const children = useSelector(selectChildren);
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
      <TableComponent {...tableProps} />
    </div>
  );
}
