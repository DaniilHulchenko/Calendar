export function getLocalText<TRecord>(
  texts: TRecord,
  key: keyof TRecord,
  locale: string | undefined
) {
  if (locale === "en") {
    return key;
  }

  const text = texts[key];

  if (text === undefined) {
    throw new Error(`Translation key ${String(key)} not found`);
  }

  return text;
}
