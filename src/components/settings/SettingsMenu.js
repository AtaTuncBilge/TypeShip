import React, { useEffect, useState } from 'react';
import { useGameContext } from '../../context/GameContext';
import { ShipSprite, SpaceBackdrop } from '../game/SpaceDecor';
import TypingToolbar from '../game/TypingToolbar';
import { getLanguageById, TYPING_CONTEXTS } from '../../constants/typingCatalog';

const SettingsMenu = ({ onBack, playerName = '', onNameChange }) => {
  const { settings, updateSettings, audioManager } = useGameContext();
  const [name, setName] = useState(playerName || localStorage.getItem('typingGamePlayerName') || '');
  const [savedLabel, setSavedLabel] = useState('saved');
  const activeLanguage = getLanguageById(settings?.language);
  const activeContext = TYPING_CONTEXTS.find((context) => context.id === settings?.typingContext) || TYPING_CONTEXTS[0];

  useEffect(() => {
    setName(playerName || localStorage.getItem('typingGamePlayerName') || '');
  }, [playerName]);

  const saveName = () => {
    const cleaned = name.trim();
    if (cleaned.length < 3) {
      setSavedLabel('need 3+ characters');
      audioManager?.playSound('error');
      return;
    }

    localStorage.setItem('typingGamePlayerName', cleaned);
    onNameChange?.(cleaned);
    setSavedLabel('saved');
    audioManager?.playSound('click');
  };

  return (
    <SpaceBackdrop className="ts-view ts-settings">
      <section className="ts-card ts-settings__panel">
        <div className="ts-settings__header">
          <div>
            <span className="ts-badge">system</span>
            <h1 className="ts-heading ts-heading--compact">Setup</h1>
          </div>
          <button className="ts-secondary-button" onClick={onBack}>back</button>
        </div>

        <TypingToolbar />

        <div className="ts-settings__grid ts-settings__grid--clean">
          <div className="ts-settings-card ts-settings-card--full">
            <span className="ts-stat__label">Call sign</span>
            <input
              className="ts-input"
              value={name}
              maxLength={16}
              onChange={(event) => {
                setName(event.target.value);
                setSavedLabel('unsaved');
              }}
              placeholder="e.g. red-7"
            />
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14 }}>
              <button className="ts-primary-button" onClick={saveName}>save</button>
              <span className={`ts-chip ${savedLabel.includes('need') ? 'is-danger' : ''}`}>{savedLabel}</span>
            </div>
          </div>

          <div className="ts-settings-card">
            <span className="ts-stat__label">Typing stack</span>
            <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
              <span className="ts-chip">{activeLanguage.flag} {activeLanguage.label}</span>
              <span className="ts-chip">{activeContext.label.toLowerCase()} context</span>
              <p className="ts-caption" style={{ margin: 0 }}>
                Search languages from the toolbar above. Context changes stay live across menu and gameplay.
              </p>
            </div>
          </div>

          <div className="ts-settings-card">
            <span className="ts-stat__label">Sound</span>
            <div style={{ marginTop: 16, display: 'grid', gap: 16 }}>
              <div className="ts-toggle">
                <button
                  type="button"
                  className={`ts-toggle__switch ${settings?.soundEnabled ? 'is-on' : ''}`}
                  onClick={() => updateSettings({ soundEnabled: !settings?.soundEnabled })}
                  aria-label="Toggle sound"
                />
                <span>{settings?.soundEnabled ? 'enabled' : 'muted'}</span>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className="ts-stat__label">Volume</span>
                  <span>{Math.round(Number(settings?.volume ?? 0.7) * 100)}%</span>
                </div>
                <input
                  className="ts-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={Number(settings?.volume ?? 0.7)}
                  onChange={(event) => updateSettings({ volume: Number(event.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="ts-settings-card ts-settings-card--art">
            <div className="ts-settings__ship-preview">
              <ShipSprite danger={!settings?.soundEnabled} />
            </div>
            <div className="ts-command__meta">
              <span className="ts-chip">adaptive pacing</span>
              <span className="ts-chip">standard mission</span>
              <span className="ts-chip">{settings?.soundEnabled ? 'audio armed' : 'silent mode'}</span>
            </div>
          </div>
        </div>
      </section>
    </SpaceBackdrop>
  );
};

export default SettingsMenu;
