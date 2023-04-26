import { Tab } from "@headlessui/react";
import { PencilIcon } from "@heroicons/react/solid";
import { useRole } from "components/auth/RoleProvider";
import LeadForm from "components/calendar/week/LeadForm";
import { leadFieldLabels } from "components/calendar/week/leadFormFields";
import merge from "components/formatting/merge";
import { useTranslation } from "components/translation";
import cellSlice from "data/redux/slices/cellSlice";
import { useAppDispatch, useAppSelector } from "data/redux/store";
import { parseISO } from "date-fns";
import { Fragment } from "react";
import { Lead } from "supabase/leads.table";
import Button from "ui/buttons/Button";
import DefaultDialogButtons from "ui/dialog/DefaultDialogButtons";
import DetailsListItem from "../details/DetailsListItem";
import useCellLead from "../useCellLead";
import { format } from "date-fns";

const InfoTabPanel = () => {
  const cell = useAppSelector((state) => state.cell);
  const cellLead = useCellLead();

  return (
    <Tab.Panel className="flex flex-grow flex-col overflow-hidden">
      {cell.draft ? (
        <LeadForm lead={cellLead} />
      ) : (
        <LeadDetails lead={cellLead} />
      )}
    </Tab.Panel>
  );
};

export default InfoTabPanel;

function LeadDetails({ lead }: { lead: Partial<Lead> }) {
  const t = useTranslation();
  const role = useRole();
  const dispatch = useAppDispatch();
  return (
    <Fragment>
      <div className="max-h-[30rem] space-y-3 overflow-y-auto p-6">
        {role === "manager" && (
          <Fragment>
            <DetailsListItem
              label={leadFieldLabels.subsystem}
              value={lead.subsystem}
            />
            <DetailsListItem
              label={leadFieldLabels.attentionPeculiarity}
              value={lead.attention_peculiarity}
            />
            <DetailsListItem label={leadFieldLabels.cache} value={lead.cache} />
            <DetailsListItem
              label={leadFieldLabels.hqLabsSynced}
              value={lead.hq_labs_synced}
            />
          </Fragment>
        )}
        <DetailsListItem
          label={leadFieldLabels.customerName}
          value={lead.customer_name}
        />
        <DetailsListItem
          label={leadFieldLabels.programPeriod}
          value={lead.programPeriod}
        />
        <DetailsListItem
          label={
            "An- und Abreise Tr."
          } /** @todo filtering now works on arrivalAt:  leadFieldLabels.arrivalAt */
          value={`${
            (lead.arrival_at
              ? format(new Date(lead.arrival_at), "dd.MM.yyyy")
              : "DD.MM.YYYY") +
            " - " +
            (lead.departure
              ? format(new Date(lead.departure), "dd.MM.yyyy")
              : (lead.arrival_at &&
                  format(new Date(lead.arrival_at), "dd.MM.yyyy")) ||
                "DD.MM.YYYY")
          }`}
        />
        <DetailsListItem
          label={leadFieldLabels.automobile}
          value={lead.automobile}
        />
        <DetailsListItem
          label={leadFieldLabels.eventTitle}
          value={
            merge(
              lead.event_title,
              lead.event_title_gmbh,
              lead.event_title_ev
            ) || t("Still open")
          }
        />
        <DetailsListItem
          label={leadFieldLabels.location}
          value={merge(lead.location, lead.location_ev)}
        />
        <DetailsListItem label={leadFieldLabels.tn} value={lead.tn} />
        <DetailsListItem
          label={leadFieldLabels.contactPerson}
          value={lead.contact_person}
        />
        <DetailsListItem label={leadFieldLabels.offload} value={lead.offload} />
        {role === "trainer" && (
          <DetailsListItem
            label={leadFieldLabels.requiredLanguage}
            value={lead.required_language}
          />
        )}
        {role === "manager" && (
          <Fragment>
            <DetailsListItem
              label={leadFieldLabels.calledAsp}
              value={lead.called_asp}
            />

            <DetailsListItem
              label={leadFieldLabels.expenditure}
              value={lead.expenditure}
            />

            <DetailsListItem
              label={leadFieldLabels.hotelBill}
              value={lead.hotel_bill}
            />

            <DetailsListItem
              label={leadFieldLabels.dailyRate}
              value={lead.daily_rate}
            />
            <DetailsListItem
              label={leadFieldLabels.requiredLanguage}
              value={lead.required_language}
            />
          </Fragment>
        )}
      </div>

      {role === "manager" && (
        <DefaultDialogButtons>
          <Button
            icon={<PencilIcon />}
            variant="contained"
            onClick={() => dispatch(cellSlice.actions.setDraft(lead))}
          >
            {t("Edit")}
          </Button>
        </DefaultDialogButtons>
      )}
    </Fragment>
  );
}
