import React, { useState } from 'react';

export const usePagination = (pagesize: number) => {
  const [cursor, setCursor] = useState(0);
  const pageChange = (event: React.ChangeEvent<unknown>, pagenumber: number) =>
    setCursor((pagenumber - 1) * pagesize);

  return {
    cursor,
    setCursor,
    pageChange,
  };
};
