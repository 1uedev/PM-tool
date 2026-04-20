"use client";

import { createContext, useContext, useState, useCallback } from "react";

const DirtyFormContext = createContext({ isDirty: false, setDirty: () => {} });

export function DirtyFormProvider({ children }) {
  const [isDirty, setIsDirty] = useState(false);

  const setDirty = useCallback((value) => setIsDirty(value), []);

  return (
    <DirtyFormContext.Provider value={{ isDirty, setDirty }}>
      {children}
    </DirtyFormContext.Provider>
  );
}

export function useDirtyForm() {
  return useContext(DirtyFormContext);
}
