import { add, formatISO } from "date-fns";

type HqPage<TValue> = {
  "@odata.context": string;
  "@odata.nextLink": string;
  value: TValue[];
};

export type HqLeadCustomFieldName =
  | "Anreise Tr."
  | "Programmzeitraum"
  | "Abreise Tr."
  | "Kontaktperson"
  | "Anzahl Trainer:innen"
  | "Standort"
  | "Standort e.V."
  | "Auto"
  | "Büro-Intern / Achtung Besonderheit"
  | "Hotelrechnung"
  | "Telefonat mit ASP"
  | "Tagessatz"
  | "Ausladen am Rückreisetag"
  | "Veranstaltungstitel"
  | "Veranstaltungstitel GmbH"
  | "Veranstaltungstitel e.V."
  | "Teilnehmerzahl"
  | "Programmbausteine"
  | "Sprache"
  | "Kurskasse";
type HqLeadCustomField = {
  Name: HqLeadCustomFieldName;
  Value: string;
  Type: string;
  Id: number;
  CreatedBy: number;
  UpdatedBy: number;
  CreatedOn: null;
  UpdatedOn: null;
};
// export type HqLeadStatusType = "NotSet" | "Successful" | "Unsuccessful" | "Open";

export type HqLeadStatusUnsuccessfulType =
  | "Absage / Zu kleines Budget"
  | "Absage / Zu teuer"
  | "Absage / VA wird verschoben"
  | "Absage / interne Absage der VA"
  | "Absage / Alle EXEO-Programmbausteine bekannt"
  | "Absage / Anderer Anbieter"
  | "Absage / Keine Rückmeldung"
  | "Absage / keine Kapazitäten EXEO"
  | "Absage / Kein Interesse_keine Akquise"
  | "Absage / Sonstiges"
  | "Storno"
  | "Unsuccessful";

export type HqLeadSuccessfulType = "Erfolgreich" | "Successful";

export type HqLeadOpenType = "Erstkontakt / Interesse" | "Konkrete Anfrage" | "Angebot" | "Open";

export type HqLeadStatusType = "NotSet" | HqLeadStatusUnsuccessfulType | HqLeadSuccessfulType | HqLeadOpenType;

type HqLeadStatus = {
  CreatedBy: number;
  CreatedOn: string;
  Id: number;
  Name: string;
  Type: HqLeadStatusType;
  UpdatedBy: number;
  UpdatedOn: string;
};

type HqLeadSubsystem = {
  CreatedBy: number;
  CreatedOn: string;
  Id: number;
  IsMaster: boolean;
  Name: string;
  UpdatedBy: number;
  UpdatedOn: string;
};

export type HqLead = {
  Name: unknown | null;
  CompanyName: string;
  Number: string;
  StatusId: number;
  CashOn: string;
  ClosingProbability: number;
  Currency: string;
  Volume: number;
  CompanyId: number;
  ResponsibleUserId: number;
  ProjectId: unknown | null;
  Id: number;
  CreatedBy: number;
  UpdatedBy: number;
  CreatedOn: string;
  UpdatedOn: string;
  CustomFields: HqLeadCustomField[];
  Status: HqLeadStatus;
  Subsystems: HqLeadSubsystem[];
};

const arrivalAt: HqLeadCustomFieldName = "Anreise Tr.";
const departure: HqLeadCustomFieldName = "Abreise Tr.";

export const fetchLeads = async (start: number, end: number, token: string) => {
  const url = new URL("https://api.hqlabs.de/v1/Leads");

  url.searchParams.set("$expand", "CustomFields,Status,Subsystems");

  const startDate = formatISO(start, { representation: "date" });

  const endDate = formatISO(add(end, { days: 1 }), {
    representation: "date",
  });

  url.searchParams.set(
    "$filter",
    `CustomFields/any(customField: customField/Name eq '${arrivalAt}' and customField/Value ge '${startDate}' and customField/Value lt '${endDate}')`,
  );

  const response = await fetch(url.href, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const page: HqPage<HqLead> = await response.json();

  return page;
};
