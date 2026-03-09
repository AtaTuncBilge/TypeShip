import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGameContext } from '../../context/GameContext';
import {
  DEFAULT_CONTEXT_ID,
  getLanguageById,
  SUPPORTED_LANGUAGES,
  TYPING_CONTEXTS,
} from '../../constants/typingCatalog';

const matchesSearch = (language, query) => {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return true;

  return [language.id, language.label].some((value) => value.toLocaleLowerCase().includes(normalized));
};

export const TypingToolbar = ({ className = '', compact = false }) => {
  const { settings, updateSettings, audioManager } = useGameContext();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [search, setSearch] = useState('');
  const pickerRef = useRef(null);

  const activeLanguage = useMemo(() => getLanguageById(settings?.language), [settings?.language]);
  const activeContext = useMemo(
    () => TYPING_CONTEXTS.find((context) => context.id === settings?.typingContext) || TYPING_CONTEXTS[0],
    [settings?.typingContext],
  );

  const filteredLanguages = useMemo(
    () => SUPPORTED_LANGUAGES.filter((language) => matchesSearch(language, search)),
    [search],
  );

  useEffect(() => {
    if (!isLanguageOpen) {
      setSearch('');
    }
  }, [isLanguageOpen]);

  useEffect(() => {
    if (!isLanguageOpen) return undefined;

    const handlePointerDown = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [isLanguageOpen]);

  return (
    <div className={['ts-toolbar', compact ? 'ts-toolbar--compact' : '', className].filter(Boolean).join(' ')}>
      <div className="ts-toolbar__contexts" role="tablist" aria-label="Typing contexts">
        {TYPING_CONTEXTS.map((context) => (
          <button
            key={context.id}
            type="button"
            className={`ts-toolbar__context ${activeContext.id === context.id ? 'is-active' : ''}`}
            onClick={() => {
              updateSettings({ typingContext: context.id });
              audioManager?.playSound('click');
            }}
          >
            {context.label}
          </button>
        ))}
      </div>

      <div ref={pickerRef} className={`ts-language-picker ${isLanguageOpen ? 'is-open' : ''}`}>
        <button
          type="button"
          className="ts-language-picker__trigger"
          onClick={() => setIsLanguageOpen((current) => !current)}
          aria-expanded={isLanguageOpen}
          aria-haspopup="dialog"
        >
          <span className="ts-language-picker__flag" aria-hidden="true">{activeLanguage.flag}</span>
          <span className="ts-language-picker__meta">
            <strong>{activeLanguage.label}</strong>
            <span>
              {activeContext.label}
              {settings?.typingContext === 'quote' && !activeLanguage.hasQuotes ? ' fallback' : ''}
            </span>
          </span>
        </button>

        {isLanguageOpen ? (
          <div className="ts-language-picker__panel" role="dialog" aria-label="Language picker">
            <div className="ts-language-picker__panel-header">
              <span className="ts-badge">language</span>
              <span className="ts-chip">{SUPPORTED_LANGUAGES.length} supported</span>
            </div>

            <input
              className="ts-language-picker__search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="search language"
              autoFocus
            />

            <div className="ts-language-picker__results">
              {filteredLanguages.map((language) => (
                <button
                  key={language.id}
                  type="button"
                  className={`ts-language-picker__option ${language.id === activeLanguage.id ? 'is-active' : ''}`}
                  onClick={() => {
                    updateSettings({
                      language: language.id,
                      typingContext: settings?.typingContext || DEFAULT_CONTEXT_ID,
                    });
                    audioManager?.playSound('click');
                    setIsLanguageOpen(false);
                  }}
                >
                  <span className="ts-language-picker__flag" aria-hidden="true">{language.flag}</span>
                  <span className="ts-language-picker__option-copy">
                    <strong>{language.label}</strong>
                    <span>{language.hasQuotes ? 'quotes ready' : 'words only'}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TypingToolbar;
