// import { useLocalStorage } from '@rehooks/local-storage';
// import React, { createContext, useContext } from 'react';
//
// type LocalStorageReturnValue<TValue> = [TValue, (newValue: TValue | null) => void, () => void];
// type TenantLocal = LocalStorageReturnValue<{ slugName: string; tenantId: string }>;
//
// const defaultTenant = { slugName: '', tenantId: '' };
// const TenantContext = createContext<TenantLocal | undefined>([
//   defaultTenant,
//   () => null,
//   () => null,
// ]);
//
// const TenantLocalProvider: React.FC<any> = ({ children }) => {
//   const slugLocalStorage =
//     typeof window !== 'undefined' ? useLocalStorage('tenant', defaultTenant) : undefined;
//
//   return <TenantContext.Provider value={slugLocalStorage}>{children}</TenantContext.Provider>;
// };
//
// export default TenantLocalProvider;
//
// export const useTenantLocal = () => useContext(TenantContext);
export {}
