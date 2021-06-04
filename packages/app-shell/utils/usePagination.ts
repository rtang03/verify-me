import React, { useState } from 'react';

export const usePagination = (pagesize: number) => {
  const [pageIndex, setPageIndex] = useState(0);
  const pageChange = (event: React.ChangeEvent<unknown>, pagenumber: number) =>
    setPageIndex((pagenumber - 1) * pagesize);

  return {
    pageIndex,
    setPageIndex,
    pageChange,
  };
};
