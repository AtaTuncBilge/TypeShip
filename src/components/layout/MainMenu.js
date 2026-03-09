import React, { useEffect, useMemo, useState } from 'react';
import { useGameContext } from '../../context/GameContext';
import { readLeaderboard } from '../../utils/localLeaderboard';
import { MeteorSprite, ShipSprite, SpaceBackdrop, TypeShipMark } from '../game/SpaceDecor';
import TypingToolbar from '../game/TypingToolbar';
import { getPreviewTokens } from '../../constants/typingCatalog';

export const MainMenu = ({ playerName = '', onNameChange, onPlay, onSettings, onLeaderboard }) => {
  const { audioManager, settings } = useGameContext();
  const [name, setName] = useState(playerName || localStorage.getItem('typingGamePlayerName') || '');
  const [leaderboard, setLeaderboard] = useState(() => readLeaderboard().slice(0, 3));
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    setName(playerName || localStorage.getItem('typingGamePlayerName') || '');
  }, [playerName]);

  useEffect(() => {
    setLeaderboard(readLeaderboard().slice(0, 3));
  }, []);

  const bestPilot = useMemo(() => leaderboard[0], [leaderboard]);
  const previewTokens = useMemo(
    () => getPreviewTokens(settings?.language, settings?.typingContext, 6),
    [settings?.language, settings?.typingContext],
  );

  const launchMission = () => {
    const cleaned = name.trim();
    if (cleaned.length < 3) {
      setNameError('Enter at least 3 characters.');
      audioManager?.playSound('error');
      return;
    }

    localStorage.setItem('typingGamePlayerName', cleaned);
    onNameChange?.(cleaned);
    audioManager?.playSound('click');
    onPlay(cleaned);
  };

  return (
    <SpaceBackdrop className="ts-view ts-menu">
      <section className="ts-card ts-menu__frame">
        <div className="ts-menu__topbar">
          <TypingToolbar compact />
        </div>

        <div className="ts-menu__hero ts-menu__hero--clean">
          <div className="ts-menu__eyebrow">
            <span className="ts-badge">redcore arcade</span>
            <span className="ts-chip">standard flight</span>
            <span className="ts-chip">{settings?.soundEnabled ? 'sound on' : 'sound off'}</span>
          </div>

          <div className="ts-menu__hero-copy">
            <div className="ts-menu__title-row">
              <div className="ts-brand-mark">
                <TypeShipMark />
              </div>
              <div className="ts-menu__title-copy">
                <h1 className="ts-brand-title ts-brand-title--single ts-brand-title--white">
                  <span>TypeShip</span>
                </h1>
                <p className="ts-subtitle ts-subtitle--narrow">
                  Monkeytype-style word flow, adaptive meteor pacing, and live language switching.
                </p>
              </div>
            </div>
          </div>

          <div className="ts-menu__hero-visual ts-menu__hero-visual--clean">
            <div className="ts-menu__hero-ring" />
            <div className="ts-menu__hero-ship ts-menu__hero-ship--clean">
              <ShipSprite />
            </div>
            <div className="ts-menu__hero-meteor ts-menu__hero-meteor--one">
              <MeteorSprite variant={0} />
            </div>
            <div className="ts-menu__hero-meteor ts-menu__hero-meteor--two">
              <MeteorSprite variant={1} />
            </div>
          </div>
        </div>

        <div className="ts-command ts-command--clean">
          <div className="ts-command__form ts-command__form--clean">
            <div>
              <label className="ts-stat__label" htmlFor="player-name">Call sign</label>
              <input
                id="player-name"
                className="ts-input"
                maxLength={16}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError('');
                }}
                placeholder="e.g. red-7"
              />
              {nameError ? <p className="ts-caption is-danger" style={{ marginTop: 8 }}>{nameError}</p> : null}
            </div>

            <div className="ts-command__meta">
              <span className="ts-chip">
                {bestPilot ? `best ${bestPilot.name} ${bestPilot.wpm}wpm` : 'best no runs yet'}
              </span>
              {previewTokens.map((token) => (
                <span key={token} className="ts-chip ts-chip--ghost">{token}</span>
              ))}
            </div>

            <div className="ts-command-actions">
              <button className="ts-primary-button" onClick={launchMission}>play</button>
              <button
                className="ts-secondary-button"
                onClick={() => {
                  audioManager?.playSound('click');
                  onSettings();
                }}
              >
                settings
              </button>
              <button
                className="ts-ghost-button"
                onClick={() => {
                  audioManager?.playSound('click');
                  onLeaderboard();
                }}
              >
                board
              </button>
            </div>
          </div>
        </div>
      </section>
    </SpaceBackdrop>
  );
};

export default MainMenu;
