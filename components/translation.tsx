import { useRouter } from "next/router";
import { useCallback } from "react";
import { getLocalText } from "ui/translation";
import texts from "./texts.json";

type TextRecord = typeof texts;

export function useTranslation() {
  const { locale } = useRouter();

  return useCallback(
    (key: keyof TextRecord) => getLocalText(texts, key, locale),
    [locale]
  );
}
