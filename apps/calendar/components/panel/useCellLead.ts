import { useAppSelector } from "data/redux/store";
import useLeadsQuery from "loading/queries/useLeadsQuery";
import { useMemo } from "react";

const useCellLead = () => {
  const cell = useAppSelector((state) => state.cell);
  const leadsQuery = useLeadsQuery();

  if (!leadsQuery.data) {
    throw new Error("Leads are empty");
  }

  return useMemo(() => {
    if (!cell.id) {
      throw new Error("Lead is not selected.");
    }

    if (cell.draft) {
      return cell.draft;
    }

    const result = leadsQuery.data.find((lead) => lead.id === cell.id);

    if (!result) {
      throw new Error("The panel did not find the selected lead.");
    }

    return result;
  }, [cell.id, cell.draft, leadsQuery.data]);
};

export default useCellLead;
