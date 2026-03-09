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
            <div className="ts-settings-card__copy">
              <span className="ts-stat__label">Call sign</span>
              <p className="ts-caption">This name is used for every locally saved result and leaderboard highlight.</p>
            </div>
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
            <div className="ts-settings-card__actions">
              <button className="ts-primary-button" onClick={saveName}>save</button>
              <span className={`ts-chip ${savedLabel.includes('need') ? 'is-danger' : ''}`}>{savedLabel}</span>
            </div>
          </div>

          <div className="ts-settings-card">
            <div className="ts-settings-card__copy">
              <span className="ts-stat__label">Typing stack</span>
              <p className="ts-caption">Search and swap from the toolbar above. Changes apply instantly to menu previews and the live run.</p>
            </div>
            <dl className="ts-settings-card__stack">
              <div>
                <dt>Language</dt>
                <dd>{activeLanguage.flag} {activeLanguage.label}</dd>
              </div>
              <div>
                <dt>Context</dt>
                <dd>{activeContext.label}</dd>
              </div>
              <div>
                <dt>Flow</dt>
                <dd>adaptive standard mission</dd>
              </div>
            </dl>
          </div>

          <div className="ts-settings-card">
            <div className="ts-settings-card__copy">
              <span className="ts-stat__label">Sound</span>
              <p className="ts-caption">Fine tune the arcade layer without affecting the typing flow.</p>
            </div>
            <div className="ts-settings-card__section">
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
                <div className="ts-settings-card__metric">
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

          <div className="ts-settings-card">
            <div className="ts-settings-card__copy">
              <span className="ts-stat__label">Match feel</span>
              <p className="ts-caption">The run is always-on. Meteor density ramps with your speed so the field never feels empty.</p>
            </div>
            <dl className="ts-settings-card__stack">
              <div>
                <dt>Input</dt>
                <dd>hidden live focus</dd>
              </div>
              <div>
                <dt>Metrics</dt>
                <dd>WPM, accuracy, streak</dd>
              </div>
              <div>
                <dt>Targeting</dt>
                <dd>closest matching meteor</dd>
              </div>
            </dl>
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
