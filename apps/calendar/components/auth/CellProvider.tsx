import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CellId } from "data/redux/slices/cellSlice";
import { Lead } from "supabase/leads.table";
type CellState = {
  id?: CellId;
  draft?: Partial<Lead>;
  updated?: boolean;
  sortBy?: string;
  appliedBy?: boolean;
  assignedBy?: boolean;
  filterBy?: string[];
  statusBy?: string[];
  staffBy?: string;
  openCreateLead?: boolean;
  slim: boolean;
  conflictedLead?: { leads: number; teamsIds: string[] }[];
  toggleUpdate?: () => void;
  toggleApply?: (value: boolean) => void;
  setUpdated?: (value: boolean) => void;
  setConflictedLead?: (value: any) => void;
  toggleAssing?: (value: boolean) => void;
  toggleSort?: (value: string) => void;
  toggleFilter?: (value: string[]) => void;
  toggleStatus?: (value: string[]) => void;
  toggleStaff?: (value: string) => void;
  toggleOpenCreateLead?: (value: boolean) => void;
  toggleSlim?: (value: boolean) => void;
  // setSlim?: Dispatch<SetStateAction<boolean>>
  correctRender?: (value: boolean) => void;
};
export const CellContext = createContext<CellState>({ slim: false });
const CellProvider = ({ children }: { children: ReactNode }) => {
  const [updated, setUpdated] = useState(false);
  const [sortBy, setSortBy] = useState("e.V.");
  const [staffBy, setStaffBy] = useState("Staff");
  const [slim, setSlim] = useState(false);
  const [correctSlim, setCorrectSlim] = useState(false);
  const [filterBy, setFilterBy] = useState<string[]>([]);
  const [statusBy, setStatusBy] = useState<string[]>([]);
  const [appliedBy, setAppliedBy] = useState(false);
  const [assignedBy, setAssignedBy] = useState(false);
  const [openCreateLead, setOpenCreateLead] = useState(false);
  const [conflictedLead, setConflictedLead] = useState([]);
  const toggleUpdate = () => setUpdated((v) => !v);
  const toggleApply = (value: boolean) => {
    setAppliedBy(value);
    setUpdated(false);
  };
  const toggleSlim = (value: boolean) => {
    setSlim(value);
    setCorrectSlim(value);
    setUpdated(false);
  };
  const correctRender = (value: boolean) => {
    setSlim(value);
    setUpdated(false);
  };
  const toggleAssing = (value: boolean) => {
    setAssignedBy(value);
    setUpdated(false);
  };
  const toggleFilter = (value: string[]) => {
    setFilterBy(value);
    setUpdated(false);
  };
  const toggleSort = (value: string) => {
    setSortBy(value);
    setUpdated(false);
  };
  const toggleStaff = (value: string) => {
    setStaffBy(value);
    setUpdated(false);
  };
  const toggleStatus = (value: string[]) => {
    setStatusBy(value);
    setUpdated(false);
  };
  const toggleOpenCreateLead = (value: boolean) => {
    setOpenCreateLead(value);
    setUpdated(false);
  };

  useEffect(() => {
    if (correctSlim !== slim) {
      setSlim(correctSlim);
    }
  }, [slim]);
  const value = useMemo(
    () => ({
      updated,
      sortBy,
      filterBy,
      statusBy,
      appliedBy,
      assignedBy,
      staffBy,
      openCreateLead,
      conflictedLead,
      slim,
      toggleUpdate,
      setUpdated,
      toggleSort,
      toggleStatus,
      toggleApply,
      toggleAssing,
      toggleFilter,
      toggleStaff,
      toggleOpenCreateLead,
      setConflictedLead,
      toggleSlim,
      correctRender,
      // setSlim
    }),
    [
      updated,
      sortBy,
      filterBy,
      statusBy,
      appliedBy,
      assignedBy,
      staffBy,
      openCreateLead,
      slim,
    ]
  );

  return <CellContext.Provider value={value}>{children}</CellContext.Provider>;
};

export default CellProvider;
