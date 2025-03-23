import { createIntl, createIntlCache } from 'react-intl';
import enMessages from './locales/en.json';

export const defaultLocale = 'en';

type NestedMessages = {
  [key: string]: string | NestedMessages;
};

type FlatMessages = {
  [key: string]: string;
};

// Flatten nested messages
const flattenMessages = (nestedMessages: NestedMessages, prefix = ''): FlatMessages => {
  return Object.keys(nestedMessages).reduce((messages: FlatMessages, key) => {
    const value = nestedMessages[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      messages[prefixedKey] = value;
    } else {
      Object.assign(messages, flattenMessages(value, prefixedKey));
    }

    return messages;
  }, {});
};

export const messages: { [key: string]: FlatMessages } = {
  en: flattenMessages(enMessages),
};

const cache = createIntlCache();

export const intl = createIntl(
  {
    locale: defaultLocale,
    messages: messages[defaultLocale],
  },
  cache
); 