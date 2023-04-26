import { HqLeadStatusType } from "data/hq/leads.hq";
import { Lead } from "supabase/leads.table";
import { formatISO } from "date-fns";
import * as yup from "yup";

/** @todo react hook form without schema */
export const leadFormSchema = yup.object({
  id: yup.number().optional(),
  status: yup.string().optional(),

  hqLabsSynced: yup.boolean().required("Required"),
  customerName: yup.string().required("Required"),
  arrivalAt: yup.string().required("Required"),
  programPeriod: yup.string().required("Required"),
  departure: yup.string().required("Required"),
  automobile: yup.string().notRequired(),

  location: yup.string().required("Required"),
  locationEv: yup.string().required("Required"),

  requiredTrainersAmount: yup
    .number()
    .min(0, "Min 0")
    .max(30, "Max 30")
    .required("Required"),

  eventTitle: yup.string().notRequired(),
  eventTitleGmbH: yup.string().notRequired(),
  eventTitleEv: yup.string().notRequired(),

  tn: yup.string().notRequired(),
  contactPerson: yup.string().notRequired(),
  offload: yup.string().notRequired(),
  calledAsp: yup.string().notRequired(),
  expenditure: yup.string().notRequired(),
  hotelBill: yup.string().notRequired(),
  attentionPeculiarity: yup.string().notRequired(),
  dailyRate: yup.string().notRequired(),
  requiredLanguage: yup.string().notRequired(),
  subsystem: yup.string().required("Required"),
  cache: yup.string().notRequired(),
});

export const yupLeadFormSchema = yup.object().shape({
  customerName: yup.string().required("Required").nullable(),
  arrivalAt: yup.date().required("Required").nullable(),
  programPeriod: yup.string().required("Required").nullable(),
  departure: yup
    .date()
    .min(yup.ref("arrivalAt"), "Departure cannot be before Arrival At")
    .required("Required")
    .nullable(),
  automobile: yup.string().notRequired().nullable(),
  requiredTrainersAmount: yup
    .number()
    .min(0, "Min 0")
    .max(30, "Max 30")
    .required("Required")
    .nullable(),
  location: yup.string().required("Required").nullable(),
  eventTitle: yup.string().notRequired().nullable(),
  tn: yup.string().notRequired().nullable(),
  contactPerson: yup.string().notRequired().nullable(),
  offload: yup.string().notRequired().nullable(),
  calledAsp: yup.string().notRequired().nullable(),
  expenditure: yup.string().notRequired().nullable(),
  hotelBill: yup.string().notRequired().nullable(),
  cache: yup.string().notRequired().nullable(),
  attentionPeculiarity: yup.string().notRequired().nullable(),
  dailyRate: yup.string().notRequired().nullable(),
  requiredLanguage: yup.string().notRequired().nullable(),
});

export const yupRedLeadFormSchema = yup.object().shape({
  customerName: yup.string().required("Required"),
  arrivalAt: yup.date().required("Required").nullable(),
  departure: yup
    .date()
    .min(yup.ref("arrivalAt"), "Departure cannot be before Arrival At")
    .required("Required")
    .nullable(),
  specialFeature: yup.string().nullable(),
});

export type LeadFieldValues = yup.InferType<typeof leadFormSchema>;

export const leadFieldLabels: Record<keyof LeadFieldValues, string> = {
  id: "Kennung",
  hqLabsSynced: "HQ-Labore synchronisiert",
  status: "Status",
  subsystem: "Subsystem",
  customerName: "Kunde",
  arrivalAt: "Anreise Tr.",
  cache: "Kurskasse",
  programPeriod: "Programmzeitraum",
  departure: "Abreise Tr.",
  contactPerson: "Kontaktperson",
  requiredTrainersAmount: "Anzahl Trainer:innen",

  location: "Standort",
  locationEv: "Standort e.V.",

  automobile: "Auto",
  attentionPeculiarity: "Büro-Intern / Achtung Besonderheit",
  hotelBill: "Hotelrechnung",
  calledAsp: "Telefonat mit ASP",
  dailyRate: "Tagessatz",
  requiredLanguage: "Sprache",
  expenditure: "Ausgaben",
  offload: "Ausladen am Rückreisetag",
  tn: "Teilnehmerzahl",

  eventTitle: "Veranstaltungstitel",
  eventTitleGmbH: "Veranstaltungstitel GmbH",
  eventTitleEv: "Veranstaltungstitel e.V.",
};

export const leadToFieldValues = (
  lead: Partial<Lead> = {}
): LeadFieldValues => ({
  id: lead.id,
  status: lead.status,
  hqLabsSynced: lead.hq_labs_synced || false,
  customerName: lead.customer_name || "",
  arrivalAt:
    lead.arrival_at || formatISO(Date.now(), { representation: "date" }),
  programPeriod: lead.programPeriod || "",
  departure: lead.departure || "",
  automobile: lead.automobile || "",
  requiredTrainersAmount: lead.required_trainers_amount || 0,

  location: lead.location || "",
  locationEv: lead.location_ev || "",

  eventTitle: lead.event_title || "",
  eventTitleGmbH: lead.event_title_gmbh || "",
  eventTitleEv: lead.event_title_ev || "",

  tn: lead.tn || "",
  contactPerson: lead.contact_person || "",
  offload: lead.offload || "",
  calledAsp: lead.called_asp || "",
  expenditure: lead.expenditure || "",
  hotelBill: lead.hotel_bill || "",
  attentionPeculiarity: lead.attention_peculiarity || "",
  dailyRate: lead.daily_rate || "",
  requiredLanguage: lead.required_language || "",
  subsystem: lead.subsystem || "",
  cache: lead.cache || "",
});
const notSetStatus: HqLeadStatusType = "NotSet";
const openStatus: HqLeadStatusType =
  "Erstkontakt / Interesse" || "Konkrete Anfrage" || "Angebot" || "Open";
const successfulStatus: HqLeadStatusType = "Erfolgreich" || "Successful";
const unsuccessfulStatus: HqLeadStatusType =
  "Absage / Zu kleines Budget" ||
  "Absage / Zu teuer" ||
  "Absage / VA wird verschoben" ||
  "Absage / interne Absage der VA" ||
  "Absage / Alle EXEO-Programmbausteine bekannt" ||
  "Absage / Anderer Anbieter" ||
  "Absage / Keine Rückmeldung" ||
  "Absage / keine Kapazitäten EXEO" ||
  "Absage / Kein Interesse_keine Akquise" ||
  "Absage / Sonstiges" ||
  "Storno" ||
  "Unsuccessful";

const hqStatuses: string[] = [
  notSetStatus,
  openStatus,
  successfulStatus,
  unsuccessfulStatus,
];

const isStatus = (status: string | undefined): status is HqLeadStatusType =>
  status !== undefined && hqStatuses.includes(status);

export const fieldValuesToLead = (
  formData: LeadFieldValues
): Partial<Lead> => ({
  id: formData.id,
  status: isStatus(formData.status) ? formData.status : notSetStatus,
  hq_labs_synced: formData.hqLabsSynced,
  customer_name: formData.customerName,
  arrival_at: formData.arrivalAt,
  automobile: formData.automobile,
  required_trainers_amount: formData.requiredTrainersAmount,
  location: formData.location,
  location_ev: formData.locationEv,
  event_title: formData.eventTitle,
  event_title_gmbh: formData.eventTitleGmbH,
  event_title_ev: formData.eventTitleEv,
  tn: formData.tn,
  contact_person: formData.contactPerson,
  offload: formData.offload,
  called_asp: formData.calledAsp,
  expenditure: formData.expenditure,
  hotel_bill: formData.hotelBill,
  attention_peculiarity: formData.attentionPeculiarity,
  cache: formData.cache,
  daily_rate: formData.dailyRate,
  required_language: formData.requiredLanguage,
  subsystem: formData.subsystem,
});
