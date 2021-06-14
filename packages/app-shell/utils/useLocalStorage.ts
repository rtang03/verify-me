import { useState } from 'react';

export const isClient = () => typeof window !== 'undefined';

// hook for LocalStorage
export const useLocalStorage = () => {
  // toogleStorage is triggered, to re-load localStorage
  const [toggleStorage, setToggleStorage] = useState(false);
  // slug in localStorage
  const [slugLocal, setSlugLocal] = useState<string | null>('');
  // tenantId in localStorage
  const [tenantIdLocal, setTenantIdLocal] = useState<string | null>('');
  // dark mode in localStorage
  const [dark, setDark] = useState(false);
  const setActiveTenant = (id: string, slug: string) => {
    if (isClient()) {
      setToggleStorage(!toggleStorage);
      localStorage.setItem('tenantId', id);
      localStorage.setItem('slug', slug);
    }
  };

  return {
    toggleStorage,
    slugLocal,
    setSlugLocal,
    tenantIdLocal,
    setTenantIdLocal,
    dark,
    setDark,
    setActiveTenant,
  };
};
