import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { CellId } from "data/redux/slices/cellSlice";
// import { Lead } from "supabase/leads.table";
type CellState = {
  id?: CellId;
  // draft?: Partial<Lead>;
  updated?: boolean;
  toggleUpdate?: () => void;
};
export const CellContext = createContext<CellState>({});

const CellProvider = ({ children }: { children: ReactNode }) => {
  const [updated, setUpdated] = useState(false);
  const toggleUpdate = () => setUpdated((v) => !v);

  const value = useMemo(
    () => ({
      updated,
      toggleUpdate,
    }),
    [updated],
  );

  return <CellContext.Provider value={value}>{children}</CellContext.Provider>;
};

export default CellProvider;
