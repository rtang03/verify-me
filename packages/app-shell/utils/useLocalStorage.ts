import { useState } from 'react';

export const isClient = () => typeof window !== 'undefined';

// hook for LocalStorage
export const useLocalStorage = () => {
  // toogleStorage is triggered, to re-load localStorage
  const [toggleStorage, setToggleStorage] = useState(1);
  // dark mode in localStorage
  const [dark, setDark] = useState(false);

  return {
    toggleStorage,
    dark,
    setDark,
    setToggleStorage,
  };
};
