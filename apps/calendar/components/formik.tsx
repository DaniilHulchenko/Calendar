import { Transition } from "@headlessui/react";
import { SaveIcon, XIcon } from "@heroicons/react/solid";
import classNames from "classnames";
import { formatISO, parseISO } from "date-fns";
import { ErrorMessage, Field, Form, Formik, FormikConfig, FormikValues, useField, useFormikContext } from "formik";
import { ComponentProps, HTMLInputTypeAttribute, MouseEventHandler, ReactNode, useEffect } from "react";
import ReactDatePicker, { CalendarContainer } from "react-datepicker";
import Button from "ui/buttons/Button";
import LoadingButton from "ui/buttons/LoadingButton";
import DefaultDialogButtons from "ui/dialog/DefaultDialogButtons";
import { LeadFieldValues } from "./calendar/week/leadFormFields";
import { useTranslation } from "./translation";

/** @deprecated */
export function TextField({
  name,
  label,
  type,
  disabled,
}: {
  name: string;
  label: string | undefined;
  type: HTMLInputTypeAttribute;
  disabled?: boolean;
}) {
  const [, meta] = useField(name);

  if (!label) {
    throw new Error(`Label for '${name}' name is undefined.`);
  }

  return (
    <div>
      <label htmlFor={name} className="label-default">
        {label}
      </label>

      <Field
        type={type}
        id={name}
        name={name}
        disabled={disabled}
        className={classNames("input-default mt-1 w-full", meta.touched && meta.error && "border-red-500")}
      />
      <FieldErrorMessage name={name} />
    </div>
  );
}

export function SelectField({
  name,
  label,
  type,
}: {
  name: string;
  label: string | undefined;
  type: HTMLInputTypeAttribute;
}) {
  const [field, meta, helpers] = useField<string>(name);

  const { value } = meta;
  const { setValue } = helpers;
  const t = useTranslation();

  if (!label) {
    throw new Error(`Label for '${name}' name is undefined.`);
  }

  return (
    <div>
      <label htmlFor={name} className="label-default">
        {label}
      </label>
      <select
        defaultValue={value}
        onChange={(language) => setValue(language.target.value ? language.target.value : "")}
        id="small"
        className="dark:text-dark mb-3 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
      >
        <option value="English">{t("English")}</option>
        <option value="German">{t("German")}</option>
        <option value={""}>{t("None")}</option>
      </select>
      <FieldErrorMessage name={name} />
    </div>
  );
}
export function SelectFieldStatus({
  name,
  label,
  type,
}: {
  name: string;
  label: string | undefined;
  type: HTMLInputTypeAttribute;
}) {
  const [field, meta, helpers] = useField<string>(name);

  const { value } = meta;
  const { setValue } = helpers;
  const t = useTranslation();

  if (!label) {
    throw new Error(`Label for '${name}' name is undefined.`);
  }

  return (
    <div>
      <label htmlFor={name} className="label-default">
        {label}
      </label>
      <select
        defaultValue={value}
        onChange={(language) => setValue(language.target.value ? language.target.value : "")}
        id="small"
        className="dark:text-dark mb-3 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
      >
        <option value="Unsuccessful">{t("Unsuccessful")}</option>
        <option value="Successful">{t("Successful")}</option>
        <option value={"Open"}>{t("Open")}</option>
      </select>
      <FieldErrorMessage name={name} />
    </div>
  );
}
export function SelectFieldSubSystem({
  name,
  label,
  type,
}: {
  name: string;
  label: string | undefined;
  type: HTMLInputTypeAttribute;
}) {
  const [field, meta, helpers] = useField<string>(name);

  const { value } = meta;
  const { setValue } = helpers;
  const t = useTranslation();

  if (!label) {
    throw new Error(`Label for '${name}' name is undefined.`);
  }

  return (
    <div className="margin-[-5px 0 0 0]">
      <label htmlFor={name} className="label-default">
        {label}
      </label>
      <select
        defaultValue={value}
        onChange={(language) => setValue(language.target.value ? language.target.value : "")}
        id="small"
        className="dark:text-dark mb-3 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
      >
        <option value="e.V.">e.V.</option>
        <option value="GmbH">GmbH</option>
        <option value={"Ausbildung"}>Ausbildung</option>
      </select>
      <FieldErrorMessage name={name} />
    </div>
  );
}

/** @todo Make generic. */
export function DatePickerField({
  label,
  name,
  minDate,
}: {
  name: keyof LeadFieldValues;
  label?: string;
  minDate?: string;
}) {
  if (!label) {
    throw new Error(`There is no label for the '${name}' name.`);
  }

  const [field, meta, helpers] = useField<string>(name);

  const { value } = meta;
  const { setValue } = helpers;
  let year, month, day;
  if (minDate) [year, month, day] = minDate.split("-");
  let convertedMinDate = year && month && day ? new Date(+year, +month - 1, +day) : undefined;

  return (
    <div>
      <label htmlFor={name} className="label-default">
        {label}
      </label>

      {/** @todo Use better date picker - dynamic styles. */}
      <ReactDatePicker
        id={name}
        showPopperArrow={false}
        minDate={convertedMinDate ? convertedMinDate : null}
        calendarContainer={(containerProps) => <CalendarContainer {...containerProps} />}
        className="input-default mt-1 w-full"
        {...field}
        selected={(value && parseISO(value)) || null}
        onChange={(date) => setValue(date ? formatISO(date, { representation: "date" }) : "")}
      />
      <FieldErrorMessage name={name} />
    </div>
  );
}

function FieldErrorMessage({ name }: { name: string }) {
  return <ErrorMessage name={name} component="div" className="mt-1 text-xs font-medium text-red-500" />;
}

export function SubmitButton(props: Omit<ComponentProps<typeof LoadingButton>, "disabled" | "loading" | "variant">) {
  const { isSubmitting } = useFormikContext();

  return <LoadingButton {...props} type="submit" disabled={isSubmitting} loading={isSubmitting} variant="contained" />;
}

export function PanelForm<TValues extends FormikValues>({
  initialValues,
  validationSchema,
  children,
  onSubmit,
  onCancel,
  onNewValues,
}: {
  initialValues: FormikConfig<TValues>["initialValues"];
  validationSchema: FormikConfig<TValues>["validationSchema"];
  children: ReactNode;
  onSubmit: FormikConfig<TValues>["onSubmit"];
  onCancel: MouseEventHandler<HTMLButtonElement>;
  onNewValues?: (values: TValues) => void;
}) {
  const t = useTranslation();
  if (typeof initialValues !== undefined) initialValues = initialValues;
  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
      <Form className="flex flex-col overflow-hidden">
        <div className="max-h-[30rem] space-y-3 overflow-y-auto p-6">{children}</div>

        <DefaultDialogButtons className="flex items-center gap-3">
          <SubmitButton type="submit" icon={<SaveIcon />}>
            {t("Save")}
          </SubmitButton>

          <Button type="button" icon={<XIcon />} variant="outlined" onClick={onCancel}>
            {t("Abort")}
          </Button>
        </DefaultDialogButtons>

        {onNewValues && <ValuesWatcher onNewValues={onNewValues} />}
      </Form>
    </Formik>
  );
}

function ValuesWatcher<TValues extends FormikValues>({ onNewValues }: { onNewValues: (values: TValues) => void }) {
  const context = useFormikContext<TValues>();

  useEffect(() => {
    onNewValues(context.values);
  }, [context.values, onNewValues]);

  return null;
}
