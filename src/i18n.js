import i18next from "i18next";
import { ref } from "vue";
import en from "@/locales/en.json";
import kh from "@/locales/kh.json";

const STORAGE_KEY = "app_lang";

export const lang = ref(localStorage.getItem(STORAGE_KEY) || "en");

const tick = ref(0);

export async function initI18n() {
  const saved = localStorage.getItem(STORAGE_KEY) || "en";
  lang.value = saved;

  await i18next.init({
    resources: {
      en: { translation: en },
      kh: { translation: kh },
    },
    lng: saved,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    returnNull: false,
  });

  document.documentElement.lang = lang.value;

  tick.value++;
}

export function t(key, options) {
  tick.value;
  return i18next.t(key, options);
}

export async function changeLang(newLang) {
  localStorage.setItem(STORAGE_KEY, newLang);
  await i18next.changeLanguage(newLang);
  lang.value = newLang;
  document.documentElement.lang = newLang;
  tick.value++;
}

// optional alias
export const setLang = changeLang;
