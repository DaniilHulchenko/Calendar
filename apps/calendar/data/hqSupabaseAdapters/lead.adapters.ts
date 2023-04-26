import { HqLead, HqLeadCustomFieldName } from "data/hq/leads.hq";
import { Lead } from "supabase/leads.table";

const customFieldValue = (hqLead: HqLead, fieldName: HqLeadCustomFieldName) => {
  const customField = hqLead.CustomFields.find((field) => field.Name.trim() === fieldName);

  if (!customField) {
    console.warn(`${hqLead.CompanyName} has no '${fieldName}' field.`);
    return null;
  }

  return customField.Value;
};

const customFieldInteger = (hqLead: HqLead, fieldName: HqLeadCustomFieldName) => {
  const value = customFieldValue(hqLead, fieldName);

  if (!value) {
    return null;
  }

  const int = Number.parseInt(value);

  if (Number.isNaN(int)) {
    return null;
  }

  return int;
};

export const hqLeadToLead = (hqLead: HqLead): Lead => {
  // const fields = hqLead.CustomFields.reduce(
  //   (prev, current) => ({
  //     ...prev,
  //     [current.Name.trim()]: current.Value,
  //   }),
  //   {}
  // );

  const arrivalAt = customFieldValue(hqLead, "Anreise Tr.");
  const departure = customFieldValue(hqLead, "Abreise Tr.");

  if (!arrivalAt) {
    throw new Error("arrivalAt is missing");
  }
  if (!departure) {
    throw new Error("departure is missing");
  }

  return {
    id: hqLead.Id,
    created_at: null,
    hq_labs_synced: false,
    cache: customFieldValue(hqLead, "Kurskasse"),
    programPeriod: customFieldValue(hqLead, "Programmzeitraum"),
    arrival_at: arrivalAt,
    departure: departure,
    contact_person: customFieldValue(hqLead, "Kontaktperson"),
    status: hqLead.Status.Type,
    customer_name: hqLead.CompanyName,
    required_language: customFieldValue(hqLead, "Sprache"),
    required_trainers_amount: customFieldInteger(hqLead, "Anzahl Trainer:innen"),

    location: customFieldValue(hqLead, "Standort"),
    location_ev: customFieldValue(hqLead, "Standort e.V."),

    automobile: customFieldValue(hqLead, "Auto"),
    attention_peculiarity: customFieldValue(hqLead, "Büro-Intern / Achtung Besonderheit"),
    hotel_bill: customFieldValue(hqLead, "Hotelrechnung"),
    called_asp: customFieldValue(hqLead, "Telefonat mit ASP"),
    daily_rate: customFieldValue(hqLead, "Tagessatz"),
    offload: customFieldValue(hqLead, "Ausladen am Rückreisetag"),

    /** @todo get from HQ */
    expenditure: "",

    event_title: customFieldValue(hqLead, "Veranstaltungstitel"),
    event_title_gmbh: customFieldValue(hqLead, "Veranstaltungstitel GmbH"),
    event_title_ev: customFieldValue(hqLead, "Veranstaltungstitel e.V."),

    tn: customFieldValue(hqLead, "Teilnehmerzahl"),
    subsystem: hqLead.Subsystems.length ? hqLead.Subsystems[0].Name : null,

    program_block_names: customFieldValue(hqLead, "Programmbausteine"),
  };
};
