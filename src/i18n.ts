// Copyright 2020 @po-polochkam authors & contributors

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './translations/ru.json';

export const changeLocale = async (settingsLocale: 'Russian'): Promise<string> => {
  const settingsLocales = {
    Russian: 'ru'
  };
  const locale: string = settingsLocales[settingsLocale];

  if (!locale) {
    throw new Error(`Change locale: ${locale} not found in settings locales`);
  }

  await i18n.changeLanguage(locale);

  return locale;
};

const resources = {
  ru: {
    translation: ru
  }
};

// eslint-disable-next-line no-void
void i18n.use(initReactI18next).init({
  debug: true,
  fallbackLng: 'ru',
  resources
});

export default i18n;
