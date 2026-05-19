"use client";

import { createContext, useContext, useState, useCallback } from "react";

const BulkSelectContext = createContext(null);

export function BulkSelectProvider({ children }) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const enter = useCallback(() => {
    setSelectedIds(new Set());
    setSelectMode(true);
  }, []);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
    setSelectMode(false);
  }, []);

  const toggle = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <BulkSelectContext.Provider value={{ selectMode, selectedIds, enter, clear, toggle }}>
      {children}
    </BulkSelectContext.Provider>
  );
}

export function useBulkSelect() {
  return useContext(BulkSelectContext);
}
