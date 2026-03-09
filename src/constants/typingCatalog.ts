import { TYPING_CODE_WORDS, TYPING_LANGUAGE_ASSETS, TYPING_LANGUAGES } from './typingData.generated';

export type TypingContextId = 'words' | 'quote' | 'punctuation' | 'numbers' | 'code';

export interface TypingContextDefinition {
  id: TypingContextId;
  label: string;
  description: string;
}

export interface TypingLanguageDefinition {
  id: string;
  label: string;
  flag: string;
  locale?: string;
  rtl?: boolean;
  hasQuotes?: boolean;
}

interface TypingLanguageAsset {
  words: string[];
  quotes: string[];
}

const MAX_POOL_SIZE = 420;
const RTL_PUNCTUATION = ['،', '؛', '؟', '«', '»'];
const LTR_PUNCTUATION = [',', '.', '!', '?', ':', ';', '"', "'", '(', ')'];
// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_REGEX = /[\u0000-\u001f\u007f]/g;

export const DEFAULT_LANGUAGE_ID = 'english';
export const DEFAULT_CONTEXT_ID: TypingContextId = 'words';

export const TYPING_CONTEXTS: TypingContextDefinition[] = [
  {
    id: 'words',
    label: 'Words',
    description: 'Frequency-based words in the selected language.',
  },
  {
    id: 'quote',
    label: 'Quotes',
    description: 'Words pulled from Monkeytype quote sets when available.',
  },
  {
    id: 'punctuation',
    label: 'Punctuation',
    description: 'Adds punctuation pressure to the selected language.',
  },
  {
    id: 'numbers',
    label: 'Numbers',
    description: 'Mixes the selected language with numeric patterns.',
  },
  {
    id: 'code',
    label: 'Code',
    description: 'TypeScript and Python-oriented code tokens.',
  },
];

export const SUPPORTED_LANGUAGES = TYPING_LANGUAGES as TypingLanguageDefinition[];

const LANGUAGE_MAP = new Map(SUPPORTED_LANGUAGES.map((language) => [language.id, language]));
const LANGUAGE_ASSETS = TYPING_LANGUAGE_ASSETS as Record<string, TypingLanguageAsset>;

const normalizeWhitespace = (value: string) => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

const cleanToken = (token: string) => normalizeWhitespace(String(token || '').normalize('NFC')).replace(CONTROL_CHAR_REGEX, '');

const unique = (values: string[]) => Array.from(new Set(values.map(cleanToken).filter(Boolean)));

const getPunctuationSet = (language: TypingLanguageDefinition) => (language?.rtl ? RTL_PUNCTUATION : LTR_PUNCTUATION);

const buildQuotePool = (asset: TypingLanguageAsset) => {
  const tokens = asset.quotes.flatMap((quote) => normalizeWhitespace(quote).split(' '));
  return unique(tokens).filter((token) => token.length <= 24);
};

const buildPunctuationPool = (words: string[], punctuationMarks: string[]) => {
  const expanded = words.flatMap((word, index) => {
    const mark = punctuationMarks[index % punctuationMarks.length];
    return [
      `${word}${mark}`,
      `${word}${punctuationMarks[(index + 1) % punctuationMarks.length]}`,
      index % 4 === 0 ? `"${word}"` : '',
      index % 5 === 0 ? `(${word})` : '',
    ];
  });

  return unique([...words, ...expanded]).filter((token) => token.length <= 26);
};

const buildNumbersPool = (words: string[]) => {
  const expanded = words.flatMap((word, index) => {
    const number = ((index * 7) % 90) + 10;
    return [
      `${word}${number}`,
      `${number}${word}`,
      `${word}-${number}`,
      `${word}_${number % 10}`,
    ];
  });

  return unique([...words, ...expanded]).filter((token) => token.length <= 24);
};

const buildCodePool = () => unique(TYPING_CODE_WORDS).filter((token) => token.length <= 24);

const getAsset = (languageId: string): TypingLanguageAsset => LANGUAGE_ASSETS[languageId] || LANGUAGE_ASSETS[DEFAULT_LANGUAGE_ID];

export const getLanguageById = (languageId?: string): TypingLanguageDefinition =>
  LANGUAGE_MAP.get(languageId || DEFAULT_LANGUAGE_ID) || LANGUAGE_MAP.get(DEFAULT_LANGUAGE_ID)!;

export const supportsQuoteContext = (languageId?: string) => Boolean(getLanguageById(languageId).hasQuotes);

export const getTypingPool = (languageId?: string, contextId: TypingContextId = DEFAULT_CONTEXT_ID): string[] => {
  const language = getLanguageById(languageId);
  const asset = getAsset(language.id);
  const baseWords = unique(asset.words).filter((word) => word.length <= 24);

  switch (contextId) {
    case 'quote': {
      const quotePool = buildQuotePool(asset);
      return (quotePool.length ? quotePool : baseWords).slice(0, MAX_POOL_SIZE);
    }
    case 'punctuation':
      return buildPunctuationPool(baseWords, getPunctuationSet(language)).slice(0, MAX_POOL_SIZE);
    case 'numbers':
      return buildNumbersPool(baseWords).slice(0, MAX_POOL_SIZE);
    case 'code':
      return buildCodePool().slice(0, MAX_POOL_SIZE);
    case 'words':
    default:
      return baseWords.slice(0, MAX_POOL_SIZE);
  }
};

export const normalizeTypedValue = (value: string, languageId?: string, preserveCase = false): string => {
  const language = getLanguageById(languageId);
  const normalized = normalizeWhitespace(String(value || '').normalize('NFC')).replace(CONTROL_CHAR_REGEX, '');
  if (preserveCase) return normalized;
  return language.locale ? normalized.toLocaleLowerCase(language.locale) : normalized.toLocaleLowerCase();
};

export const getPreviewTokens = (languageId?: string, contextId: TypingContextId = DEFAULT_CONTEXT_ID, count = 8): string[] =>
  getTypingPool(languageId, contextId).slice(0, count);
