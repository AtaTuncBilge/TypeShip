import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameContext } from '../../context/GameContext';
import { readLeaderboard, saveScoreToLeaderboard } from '../../utils/localLeaderboard';
import {
  DEFAULT_CONTEXT_ID,
  getLanguageById,
  getTypingPool,
  normalizeTypedValue,
  TYPING_CONTEXTS,
} from '../../constants/typingCatalog';
import { ExplosionBurst, MeteorSprite, ShipSprite, SpaceBackdrop, resolveDifficulty } from './SpaceDecor';
import TypingToolbar from './TypingToolbar';

const MAX_FRAME_MS = 42;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const randomBetween = (min, max) => min + Math.random() * (max - min);
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const calculateWpm = (correctChars, elapsedMs) => {
  if (!elapsedMs) return 0;
  const words = correctChars / 5;
  const elapsedMinutes = elapsedMs / 60000;
  return Math.max(0, Math.round(words / elapsedMinutes));
};
const calculateAccuracy = (keystrokes, correctChars) => (keystrokes > 0 ? Math.round((correctChars / keystrokes) * 100) : 100);
const getShipPoint = (arenaSize) => ({
  x: arenaSize.width < 680 ? 108 : 146,
  y: arenaSize.height * 0.54,
});

const getMeteorLaneCenters = (arenaSize) => {
  const topPadding = arenaSize.height < 700 ? 94 : 118;
  const bottomPadding = arenaSize.width < 680
    ? Math.max(228, arenaSize.height * 0.29)
    : Math.max(214, arenaSize.height * 0.25);
  const laneCount = arenaSize.height < 640 ? 3 : arenaSize.height < 900 ? 4 : 5;
  const usableHeight = Math.max(180, arenaSize.height - topPadding - bottomPadding);

  return Array.from({ length: laneCount }, (_, index) => topPadding + (usableHeight * (index + 0.5)) / laneCount);
};

const getTimeToImpact = (meteor) => {
  const remainingDistance = Math.hypot(meteor.impactX - meteor.x, meteor.impactY - meteor.y);
  const speed = Math.max(24, Math.hypot(meteor.vx, meteor.vy));
  return remainingDistance / speed;
};

const pickTargetMeteor = (meteors, firstChar) => {
  const matches = meteors.filter((meteor) => meteor.text.startsWith(firstChar));
  if (!matches.length) return null;

  return matches.sort((a, b) => getTimeToImpact(a) - getTimeToImpact(b) || a.y - b.y)[0];
};

const formatEta = (meteor) => `${Math.max(0.2, getTimeToImpact(meteor)).toFixed(1)}s`;
const graphemeSegmenter = typeof Intl !== 'undefined' && Intl.Segmenter
  ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  : null;

const splitGraphemes = (value) => {
  const normalized = String(value || '').normalize('NFC');
  if (!graphemeSegmenter) {
    return Array.from(normalized);
  }

  return Array.from(graphemeSegmenter.segment(normalized), ({ segment }) => segment);
};

const formatWordLabel = (value, locale) => {
  if (!value) return '';
  return locale ? value.toLocaleUpperCase(locale) : value.toLocaleUpperCase();
};

export const GameScreen = ({ onExit, playerName }) => {
  const { settings = {}, audioManager } = useGameContext();
  const profile = useMemo(() => resolveDifficulty(), []);
  const activeLanguage = useMemo(() => getLanguageById(settings?.language), [settings?.language]);
  const activeContext = useMemo(
    () => TYPING_CONTEXTS.find((context) => context.id === settings?.typingContext) || TYPING_CONTEXTS.find((context) => context.id === DEFAULT_CONTEXT_ID),
    [settings?.typingContext],
  );
  const candidateWords = useMemo(
    () => getTypingPool(activeLanguage.id, activeContext?.id || DEFAULT_CONTEXT_ID)
      .map((word) => normalizeTypedValue(word, activeLanguage.id))
      .filter((word) => word.length >= profile.minTokenLength && word.length <= profile.maxTokenLength),
    [activeContext?.id, activeLanguage.id, profile.maxTokenLength, profile.minTokenLength],
  );

  const arenaRef = useRef(null);
  const inputRef = useRef(null);
  const frameRef = useRef(0);
  const nextSpawnRef = useRef(0);
  const lastFrameRef = useRef(0);
  const startTimeRef = useRef(0);
  const pauseStartedAtRef = useRef(0);
  const pausedDurationRef = useRef(0);
  const finishGuardRef = useRef(false);
  const hitTimeoutRef = useRef(0);
  const statusTimeoutRef = useRef(0);
  const recentClearsRef = useRef([]);

  const arenaSizeRef = useRef({ width: window.innerWidth, height: window.innerHeight });
  const meteorsRef = useRef([]);
  const lasersRef = useRef([]);
  const explosionsRef = useRef([]);
  const typedRef = useRef('');
  const targetRef = useRef(null);
  const statsRef = useRef({ keystrokes: 0, correctChars: 0 });
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);
  const hullRef = useRef(profile.hull);
  const destroyedRef = useRef(0);
  const accuracyRef = useRef(100);
  const wpmRef = useRef(0);

  const [arenaSize, setArenaSize] = useState(arenaSizeRef.current);
  const [meteors, setMeteors] = useState([]);
  const [lasers, setLasers] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [typed, setTyped] = useState('');
  const [activeTargetId, setActiveTargetId] = useState(null);
  const [inputError, setInputError] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState('Mission complete');
  const [timeLeft, setTimeLeft] = useState(profile.sessionSeconds);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hull, setHull] = useState(profile.hull);
  const [destroyed, setDestroyed] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [wpm, setWpm] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [shipHitFlash, setShipHitFlash] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Focus the field and start typing to lock the closest meteor.');

  const shipPoint = useMemo(() => getShipPoint(arenaSize), [arenaSize]);

  const syncArenaSize = useCallback(() => {
    const nextSize = arenaRef.current
      ? {
          width: arenaRef.current.clientWidth,
          height: arenaRef.current.clientHeight,
        }
      : { width: window.innerWidth, height: window.innerHeight };

    arenaSizeRef.current = nextSize;
    setArenaSize(nextSize);
  }, []);

  const getElapsedMs = useCallback(
    (now = performance.now()) => {
      if (!startTimeRef.current) return 0;
      const activePause = isPaused && pauseStartedAtRef.current ? now - pauseStartedAtRef.current : 0;
      return Math.max(0, now - startTimeRef.current - pausedDurationRef.current - activePause);
    },
    [isPaused],
  );

  const syncStats = useCallback(
    (now = performance.now()) => {
      const elapsedMs = getElapsedMs(now);
      const nextAccuracy = calculateAccuracy(statsRef.current.keystrokes, statsRef.current.correctChars);
      const nextWpm = calculateWpm(statsRef.current.correctChars, elapsedMs);

      if (nextAccuracy !== accuracyRef.current) {
        accuracyRef.current = nextAccuracy;
        setAccuracy(nextAccuracy);
      }

      if (nextWpm !== wpmRef.current) {
        wpmRef.current = nextWpm;
        setWpm(nextWpm);
      }
    },
    [getElapsedMs],
  );

  const showStatus = useCallback((message) => {
    if (!message) return;
    setStatusMessage(message);
    window.clearTimeout(statusTimeoutRef.current);
    statusTimeoutRef.current = window.setTimeout(() => {
      setStatusMessage('Tab clears the current lock. Esc pauses the run.');
    }, 1800);
  }, []);

  const pulseShipHit = useCallback(() => {
    setShipHitFlash(true);
    window.clearTimeout(hitTimeoutRef.current);
    hitTimeoutRef.current = window.setTimeout(() => setShipHitFlash(false), 380);
  }, []);

  const clearTargetInput = useCallback(
    (message) => {
      typedRef.current = '';
      targetRef.current = null;
      setTyped('');
      setActiveTargetId(null);
      setInputError(false);
      if (message) {
        showStatus(message);
      }
    },
    [showStatus],
  );

  const pushExplosion = useCallback((x, y, size, life = 520) => {
    const nextExplosion = {
      id: uid('explosion'),
      x,
      y,
      size,
      expiresAt: performance.now() + life,
    };
    const next = [...explosionsRef.current, nextExplosion];
    explosionsRef.current = next;
    setExplosions(next);
  }, []);

  const pushLaser = useCallback((target, finisher = false) => {
    const point = getShipPoint(arenaSizeRef.current);
    const dx = target.x - point.x;
    const dy = target.y - point.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    const nextLaser = {
      id: uid('laser'),
      x: point.x,
      y: point.y,
      length,
      angle,
      expiresAt: performance.now() + (finisher ? 180 : 130),
    };

    const next = [...lasersRef.current, nextLaser];
    lasersRef.current = next;
    setLasers(next);
  }, []);

  const createMeteor = useCallback(() => {
    if (!candidateWords.length) return null;

    const area = arenaSizeRef.current;
    const ship = getShipPoint(area);
    const laneCenters = getMeteorLaneCenters(area);

    let text = candidateWords[Math.floor(Math.random() * candidateWords.length)];
    const occupied = new Set(meteorsRef.current.map((meteor) => meteor.text));
    for (let attempt = 0; attempt < 6 && occupied.has(text); attempt += 1) {
      text = candidateWords[Math.floor(Math.random() * candidateWords.length)];
    }

    const size = clamp(116 + text.length * 3.2, 118, 182);

    const laneOptions = laneCenters
      .map((laneY, laneIndex) => {
        const laneMeteors = meteorsRef.current.filter((meteor) => meteor.laneIndex === laneIndex);
        const rightMost = laneMeteors.reduce((maxX, meteor) => Math.max(maxX, meteor.x + meteor.size * 0.75), 0);
        const minGap = laneMeteors.length
          ? Math.min(...laneMeteors.map((meteor) => Math.abs(area.width + size - meteor.x)))
          : Number.MAX_SAFE_INTEGER;

        return {
          laneIndex,
          laneY,
          minGap,
          rightMost,
          load: laneMeteors.length,
        };
      })
      .sort((a, b) => b.minGap - a.minGap || a.load - b.load);

    const selectedLane = laneOptions[0];
    const baseY = clamp(selectedLane.laneY + randomBetween(-6, 6), size * 0.55 + 20, area.height - size * 0.55 - 28);
    const spawnBaseX = area.width + size * 0.9 + randomBetween(26, 72);
    const spawnX = Math.max(spawnBaseX, selectedLane.rightMost + size * 1.32 + randomBetween(18, 48));
    const impactX = ship.x + randomBetween(28, 52);
    const impactY = baseY;
    const travelSeconds = randomBetween(profile.travelMin, profile.travelMax);
    const floatPhase = randomBetween(0, Math.PI * 2);
    const floatAmplitude = randomBetween(1.4, 4.2);

    return {
      id: uid('meteor'),
      text,
      x: spawnX,
      y: baseY,
      shellFloatY: Math.sin(floatPhase) * floatAmplitude,
      vx: (impactX - spawnX) / travelSeconds,
      vy: 0,
      impactX,
      impactY,
      laneIndex: selectedLane.laneIndex,
      baseY,
      floatPhase,
      floatAmplitude,
      floatSpeed: randomBetween(0.42, 0.78),
      size,
      rotation: randomBetween(0, 360),
      spin: randomBetween(-5, 5),
      variant: Math.floor(Math.random() * 3),
    };
  }, [candidateWords, profile.travelMax, profile.travelMin]);

  const resetRoundState = useCallback(() => {
    finishGuardRef.current = false;
    typedRef.current = '';
    targetRef.current = null;
    meteorsRef.current = [];
    lasersRef.current = [];
    explosionsRef.current = [];
    recentClearsRef.current = [];
    statsRef.current = { keystrokes: 0, correctChars: 0 };
    streakRef.current = 0;
    bestStreakRef.current = 0;
    hullRef.current = profile.hull;
    destroyedRef.current = 0;
    accuracyRef.current = 100;
    wpmRef.current = 0;

    setTyped('');
    setActiveTargetId(null);
    setInputError(false);
    setMeteors([]);
    setLasers([]);
    setExplosions([]);
    setStreak(0);
    setBestStreak(0);
    setHull(profile.hull);
    setDestroyed(0);
    setAccuracy(100);
    setWpm(0);
    setTimeLeft(profile.sessionSeconds);
    setGameOver(false);
    setGameOverReason('Mission complete');
    setShipHitFlash(false);
    setStatusMessage('Focus the field and start typing to lock the closest meteor.');
  }, [profile.hull, profile.sessionSeconds]);

  const finishGame = useCallback(
    (reason) => {
      if (finishGuardRef.current) return;
      finishGuardRef.current = true;

      window.cancelAnimationFrame(frameRef.current);
      syncStats(performance.now());

      const finalBoard = saveScoreToLeaderboard({
        name: playerName?.trim() || localStorage.getItem('typingGamePlayerName') || 'anon',
        wpm: wpmRef.current,
        accuracy: accuracyRef.current,
        time: profile.sessionSeconds,
      });

      setLeaderboard(finalBoard.slice(0, 10));
      setIsGameActive(false);
      setIsPaused(false);
      setGameOver(true);
      setGameOverReason(reason);
      audioManager?.pauseSound('ambient');
    },
    [audioManager, playerName, profile.sessionSeconds, syncStats],
  );

  const destroyMeteor = useCallback(
    (meteor) => {
      const nextMeteors = meteorsRef.current.filter((entry) => entry.id !== meteor.id);
      meteorsRef.current = nextMeteors;
      setMeteors(nextMeteors);

      pushExplosion(meteor.x, meteor.y, meteor.size * 0.9, 600);
      audioManager?.playSound('hit');

      const nextStreak = streakRef.current + 1;
      const nextBestStreak = Math.max(bestStreakRef.current, nextStreak);
      const nextDestroyed = destroyedRef.current + 1;

      streakRef.current = nextStreak;
      bestStreakRef.current = nextBestStreak;
      destroyedRef.current = nextDestroyed;
      recentClearsRef.current = [...recentClearsRef.current.filter((stamp) => performance.now() - stamp < 5600), performance.now()];
      nextSpawnRef.current = Math.min(nextSpawnRef.current, performance.now() + 140);

      setStreak(nextStreak);
      setBestStreak(nextBestStreak);
      setDestroyed(nextDestroyed);
      clearTargetInput(`${meteor.text} cleared.`);
    },
    [audioManager, clearTargetInput, pushExplosion],
  );

  const damageShip = useCallback(
    (impactedMeteors) => {
      if (!impactedMeteors.length) return;

      impactedMeteors.forEach((meteor, index) => {
        pushExplosion(meteor.x, meteor.y, meteor.size * 0.8, 480);
        pushExplosion(shipPoint.x + randomBetween(-36, 36), shipPoint.y + randomBetween(-20, 8), 120 + index * 10, 560);
      });

      const nextHull = clamp(hullRef.current - impactedMeteors.length * profile.impactDamage, 0, profile.hull);
      hullRef.current = nextHull;
      streakRef.current = 0;
      setHull(nextHull);
      setStreak(0);
      pulseShipHit();
      audioManager?.playSound('impact');

      if (impactedMeteors.some((meteor) => meteor.id === targetRef.current)) {
        clearTargetInput('Target lost during impact.');
      }

      if (nextHull <= 0) {
        finishGame('Ship destroyed');
      }
    },
    [audioManager, clearTargetInput, finishGame, profile.hull, profile.impactDamage, pulseShipHit, pushExplosion, shipPoint.x, shipPoint.y],
  );

  const step = useCallback(
    (now) => {
      if (!isGameActive || isPaused || gameOver) return;

      const delta = Math.min(MAX_FRAME_MS, now - (lastFrameRef.current || now));
      lastFrameRef.current = now;

      const remainingMs = Math.max(0, profile.sessionSeconds * 1000 - getElapsedMs(now));
      const nextTime = Math.ceil(remainingMs / 1000);
      setTimeLeft((current) => (current === nextTime ? current : nextTime));

      if (remainingMs <= 0) {
        finishGame('Mission complete');
        return;
      }

      let workingMeteors = meteorsRef.current.map((meteor) => ({
        ...meteor,
        floatPhase: meteor.floatPhase + meteor.floatSpeed * (delta / 1000),
        x: meteor.x + meteor.vx * (delta / 1000),
        y: meteor.baseY,
        shellFloatY: Math.sin(meteor.floatPhase + meteor.floatSpeed * (delta / 1000)) * meteor.floatAmplitude,
        rotation: meteor.rotation + meteor.spin * (delta / 1000),
      }));

      const impacted = [];
      const ship = getShipPoint(arenaSizeRef.current);

      workingMeteors = workingMeteors.filter((meteor) => {
        const distance = Math.hypot(meteor.x - ship.x, meteor.y - ship.y);
        const breached = meteor.x <= meteor.impactX || distance < meteor.size * 0.35 + 30;
        if (breached) {
          impacted.push(meteor);
          return false;
        }
        return true;
      });

      if (impacted.length) {
        damageShip(impacted);
      }

      if (finishGuardRef.current) {
        return;
      }

      const activeStillExists = workingMeteors.some((meteor) => meteor.id === targetRef.current);
      if (!activeStillExists && targetRef.current) {
        clearTargetInput('Target drifted out of lock.');
      }

      const recentClears = recentClearsRef.current.filter((stamp) => now - stamp < 5600);
      recentClearsRef.current = recentClears;
      const desiredMeteorCount = clamp(
        profile.baseVisibleMeteors
          + Math.min(2, Math.floor(recentClears.length / 3))
          + Math.min(2, Math.floor(wpmRef.current / 34))
          + (accuracyRef.current >= 97 ? 1 : 0)
          - (activeContext?.id === 'quote' || activeContext?.id === 'code' ? 1 : 0),
        2,
        profile.maxMeteors,
      );

      if (now >= nextSpawnRef.current && workingMeteors.length < desiredMeteorCount) {
        const spawnTarget = workingMeteors.length === 0
          ? desiredMeteorCount
          : Math.min(desiredMeteorCount, workingMeteors.length + 2);

        while (workingMeteors.length < spawnTarget) {
          meteorsRef.current = workingMeteors;
          const meteor = createMeteor();
          if (!meteor) break;
          workingMeteors = [...workingMeteors, meteor];
        }

        const spawnDelay = clamp(
          profile.baseSpawnDelay
            - recentClears.length * 48
            - wpmRef.current * 4
            - Math.max(0, desiredMeteorCount - workingMeteors.length) * 110,
          profile.minSpawnDelay,
          profile.maxSpawnDelay,
        );
        nextSpawnRef.current = now + spawnDelay;
      }

      meteorsRef.current = workingMeteors;
      setMeteors(workingMeteors);

      const nextLasers = lasersRef.current.filter((laser) => laser.expiresAt > now);
      const nextExplosions = explosionsRef.current.filter((explosion) => explosion.expiresAt > now);

      if (nextLasers.length !== lasersRef.current.length) {
        lasersRef.current = nextLasers;
        setLasers(nextLasers);
      }
      if (nextExplosions.length !== explosionsRef.current.length) {
        explosionsRef.current = nextExplosions;
        setExplosions(nextExplosions);
      }

      if (finishGuardRef.current) {
        return;
      }

      syncStats(now);
      frameRef.current = window.requestAnimationFrame(step);
    },
    [activeContext?.id, clearTargetInput, createMeteor, damageShip, finishGame, gameOver, getElapsedMs, isGameActive, isPaused, profile.baseSpawnDelay, profile.baseVisibleMeteors, profile.maxMeteors, profile.maxSpawnDelay, profile.minSpawnDelay, profile.sessionSeconds, syncStats],
  );

  const startGame = useCallback(() => {
    resetRoundState();
    setLeaderboard(readLeaderboard().slice(0, 10));
    setIsPaused(false);
    setIsGameActive(true);
    audioManager?.unlock?.();

    const now = performance.now();
    startTimeRef.current = now;
    pausedDurationRef.current = 0;
    pauseStartedAtRef.current = 0;
    lastFrameRef.current = now;

    const initialWave = [];
    meteorsRef.current = initialWave;
    while (initialWave.length < profile.baseVisibleMeteors) {
      meteorsRef.current = initialWave;
      const meteor = createMeteor();
      if (!meteor) break;
      initialWave.push(meteor);
    }
    meteorsRef.current = initialWave;
    setMeteors(initialWave);
    nextSpawnRef.current = now + 220;

    audioManager?.pauseSound('ambient');
    if (settings?.soundEnabled) {
      audioManager?.playSound('ambient');
    }

    window.requestAnimationFrame(() => inputRef.current?.focus());
    showStatus('Typing active. The game will keep filling the lane as you clear targets.');
  }, [audioManager, createMeteor, profile.baseVisibleMeteors, resetRoundState, settings?.soundEnabled, showStatus]);

  const togglePause = useCallback(() => {
    if (!isGameActive || gameOver) return;

    setIsPaused((current) => {
      const next = !current;
      if (next) {
        pauseStartedAtRef.current = performance.now();
        audioManager?.pauseSound('ambient');
      } else {
        const now = performance.now();
        pausedDurationRef.current += now - pauseStartedAtRef.current;
        pauseStartedAtRef.current = 0;
        lastFrameRef.current = now;
        if (settings?.soundEnabled) {
          audioManager?.playSound('ambient');
        }
        window.requestAnimationFrame(() => inputRef.current?.focus());
      }
      return next;
    });
  }, [audioManager, gameOver, isGameActive, settings?.soundEnabled]);

  const processChar = useCallback(
    (character) => {
      if (!isGameActive || isPaused || gameOver) return;

      const nextTyped = `${typedRef.current}${character}`;
      const liveMeteors = meteorsRef.current;
      const lockedTarget = liveMeteors.find((meteor) => meteor.id === targetRef.current) || pickTargetMeteor(liveMeteors, nextTyped[0]);

      statsRef.current.keystrokes += 1;

      if (!lockedTarget) {
        setInputError(true);
        audioManager?.playSound('error');
        showStatus('No visible meteor matches that opening letter.');
        syncStats(performance.now());
        return;
      }

      typedRef.current = nextTyped;
      setTyped(nextTyped);
      targetRef.current = lockedTarget.id;
      setActiveTargetId(lockedTarget.id);

      const expectedPrefix = lockedTarget.text.slice(0, nextTyped.length);
      const isCorrect = expectedPrefix === nextTyped;

      if (isCorrect) {
        statsRef.current.correctChars += 1;
        setInputError(false);
        audioManager?.playSound('type');
        pushLaser(lockedTarget, nextTyped === lockedTarget.text);

        if (nextTyped === lockedTarget.text) {
          destroyMeteor(lockedTarget);
        } else if (nextTyped.length === 1) {
          showStatus(`Lock acquired on ${formatWordLabel(lockedTarget.text, activeLanguage.locale)}.`);
        }
      } else {
        setInputError(true);
        audioManager?.playSound('error');
        showStatus('Trajectory mismatch. Backspace or clear target.');
      }

      syncStats(performance.now());
    },
    [activeLanguage.locale, audioManager, destroyMeteor, gameOver, isGameActive, isPaused, pushLaser, showStatus, syncStats],
  );

  const handleInputChange = useCallback(
    (event) => {
      const normalized = normalizeTypedValue(event.target.value, activeLanguage.id);
      const previous = typedRef.current;

      if (!isGameActive || isPaused || gameOver) {
        setTyped(normalized);
        typedRef.current = normalized;
        return;
      }

      if (normalized === previous) return;

      if (normalized.length < previous.length) {
        typedRef.current = normalized;
        setTyped(normalized);
        setInputError(false);
        if (!normalized.length) {
          targetRef.current = null;
          setActiveTargetId(null);
          showStatus('Lock released.');
        }
        syncStats(performance.now());
        return;
      }

      const appended = normalized.startsWith(previous) ? normalized.slice(previous.length) : normalized;
      if (!normalized.startsWith(previous)) {
        clearTargetInput();
      }

      [...appended].forEach((character) => processChar(character));
    },
    [activeLanguage.id, clearTargetInput, gameOver, isGameActive, isPaused, processChar, showStatus, syncStats],
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (!isGameActive || isPaused || gameOver) return;

      if (event.key === 'Tab') {
        event.preventDefault();
        clearTargetInput('Lock cleared.');
      }

      if (event.key === ' ') {
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
      }
    },
    [clearTargetInput, gameOver, isGameActive, isPaused],
  );

  useEffect(() => {
    syncArenaSize();
    window.addEventListener('resize', syncArenaSize);
    return () => window.removeEventListener('resize', syncArenaSize);
  }, [syncArenaSize]);

  useEffect(() => {
    arenaSizeRef.current = arenaSize;
  }, [arenaSize]);

  useEffect(() => {
    resetRoundState();
    setLeaderboard(readLeaderboard().slice(0, 10));
  }, [profile.key, resetRoundState]);

  useEffect(() => {
    if (!isGameActive || isPaused || gameOver) {
      window.cancelAnimationFrame(frameRef.current);
      return undefined;
    }

    frameRef.current = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameRef.current);
  }, [gameOver, isGameActive, isPaused, step]);

  useEffect(() => {
    const handleWindowKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        togglePause();
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [togglePause]);

  useEffect(
    () => () => {
      window.cancelAnimationFrame(frameRef.current);
      window.clearTimeout(hitTimeoutRef.current);
      window.clearTimeout(statusTimeoutRef.current);
      audioManager?.pauseSound('ambient');
    },
    [audioManager],
  );

  const activeTarget = useMemo(() => meteors.find((meteor) => meteor.id === activeTargetId) || null, [activeTargetId, meteors]);
  const threats = useMemo(() => [...meteors].sort((a, b) => getTimeToImpact(a) - getTimeToImpact(b)).slice(0, 2), [meteors]);
  const quoteFallback = activeContext?.id === 'quote' && !activeLanguage.hasQuotes;
  const typedSegments = useMemo(() => splitGraphemes(typed), [typed]);
  const timeProgress = useMemo(
    () => clamp((timeLeft / profile.sessionSeconds) * 100, 0, 100),
    [profile.sessionSeconds, timeLeft],
  );
  return (
    <SpaceBackdrop className="ts-game">
      <div ref={arenaRef} className={`ts-game__arena ${shipHitFlash ? 'is-hit' : ''}`} onClick={() => inputRef.current?.focus()}>
        {lasers.map((laser) => (
          <div
            key={laser.id}
            className="ts-laser"
            style={{
              width: `${laser.length}px`,
              transform: `translate(${laser.x}px, ${laser.y - 7}px) rotate(${laser.angle}deg)`,
            }}
          >
            <div className="ts-laser__glow" />
            <div className="ts-laser__core" />
          </div>
        ))}

        {meteors.map((meteor) => {
          const isActive = meteor.id === activeTargetId;
          const danger = meteor.x < shipPoint.x + 260;
          const meteorSegments = splitGraphemes(meteor.text);
          const progress = isActive ? clamp((typedSegments.length / meteorSegments.length) * 100, 0, 100) : 0;

          return (
            <div
              key={meteor.id}
              className={`ts-meteor ${isActive ? 'is-active' : ''}`}
              style={{
                width: `${meteor.size}px`,
                height: `${meteor.size}px`,
                transform: `translate3d(${meteor.x - meteor.size / 2}px, ${meteor.y - meteor.size / 2}px, 0)`,
              }}
            >
              <div
                className="ts-meteor__shell"
                style={{ transform: `translate3d(0, ${meteor.shellFloatY || 0}px, 0) rotate(${meteor.rotation}deg)` }}
              >
                <MeteorSprite active={isActive} danger={danger} variant={meteor.variant} />
              </div>
              {isActive ? <div className="ts-target-reticle" /> : null}
              <div className={`ts-meteor__label ${isActive ? 'is-active' : ''}`} dir={activeLanguage.rtl ? 'rtl' : 'ltr'}>
                <span className="ts-meteor__word">
                  {meteorSegments.map((segment, index) => {
                    if (!isActive || index >= typedSegments.length) {
                      return <span key={`${meteor.id}-${index}`}>{segment}</span>;
                    }

                    const charClass = normalizeTypedValue(typedSegments[index], activeLanguage.id) === normalizeTypedValue(segment, activeLanguage.id)
                      ? 'is-hit'
                      : 'is-miss';
                    return (
                      <span key={`${meteor.id}-${index}`} className={charClass}>
                        {segment}
                      </span>
                    );
                  })}
                </span>
                {isActive ? (
                  <div className="ts-meteor__progress">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        {explosions.map((explosion) => (
          <div
            key={explosion.id}
            className="ts-explosion"
            style={{
              width: `${explosion.size}px`,
              height: `${explosion.size}px`,
              transform: `translate3d(${explosion.x - explosion.size / 2}px, ${explosion.y - explosion.size / 2}px, 0)`,
            }}
          >
            <ExplosionBurst />
          </div>
        ))}

        <div
          className={`ts-ship-zone ${shipHitFlash ? 'is-hit' : ''}`}
          style={{ transform: `translate3d(${shipPoint.x}px, ${shipPoint.y}px, 0) translate(-50%, -50%)` }}
        >
          <ShipSprite danger={shipHitFlash} />
        </div>
      </div>

      <div className="ts-game__toolbar">
        <TypingToolbar compact />
      </div>

      <div className="ts-game__hud">
        <div className="ts-hud-card ts-hud-card--brand">
          <div className="ts-console__top">
            <span className="ts-badge">standard mission</span>
            <span className="ts-chip">{playerName?.trim() || localStorage.getItem('typingGamePlayerName') || 'anon'}</span>
          </div>
          <div className="ts-console__target" style={{ marginTop: 12 }}>
            {activeLanguage.flag} <strong>{activeLanguage.label}</strong> · {activeContext?.label || 'Words'}
          </div>
          <div className={`ts-hull-meter ${hull <= 34 ? 'is-critical' : ''}`}>
            <span style={{ width: `${clamp(hull, 0, 100)}%` }} />
          </div>
        </div>

        <div className="ts-hud__stats--clean ts-hud__stats--mission">
          <div className="ts-hud-card">
            <span className="ts-stat__label">WPM</span>
            <strong className="ts-stat__value">{wpm}</strong>
          </div>
          <div className="ts-hud-card">
            <span className="ts-stat__label">Accuracy</span>
            <strong className="ts-stat__value">{accuracy}%</strong>
          </div>
          <div className="ts-hud-card">
            <span className="ts-stat__label">Ship</span>
            <strong className="ts-stat__value">{hull}</strong>
          </div>
          <div className="ts-hud-card">
            <span className="ts-stat__label">Time</span>
            <strong className="ts-stat__value">{timeLeft}s</strong>
            <div className={`ts-time-meter ${timeLeft <= 15 ? 'is-critical' : ''}`}>
              <span style={{ width: `${timeProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="ts-console ts-console--clean ts-console--mission">
        <div className="ts-console__top">
          <div className="ts-console__target">
            target <strong>{activeTarget ? activeTarget.text : 'idle'}</strong>
          </div>
          <div className="ts-console__metrics">
            <span className="ts-chip">cleared {destroyed}</span>
            <span className="ts-chip">streak {streak}</span>
            <span className="ts-chip">threats {meteors.length}</span>
            {quoteFallback ? <span className="ts-chip ts-chip--warning">quote fallback</span> : null}
          </div>
        </div>
        <div className={`ts-console__status ${inputError ? 'is-error' : ''}`}>{statusMessage}</div>
        <div className="ts-console__threats">
          {threats.length === 0 ? (
            <span className="ts-chip">clear</span>
          ) : (
            threats.map((meteor) => (
              <span key={meteor.id} className="ts-chip ts-chip--threat">
                {meteor.text} {formatEta(meteor)}
              </span>
            ))
          )}
        </div>
        <div className={`ts-console__readout ${typed ? '' : 'is-placeholder'}`} dir={activeLanguage.rtl ? 'rtl' : 'ltr'}>
          {typed || 'start typing to acquire a target'}
        </div>
        <input
          ref={inputRef}
          className="ts-console__ghost-input"
          value={typed}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          inputMode="text"
          aria-label="Typing input"
        />
        <div className="ts-console__footer">
          <span>tab clear lock</span>
          <span>esc pause</span>
          <span>hidden live input</span>
        </div>
      </div>

      {!isGameActive && !gameOver ? (
        <div className="ts-overlay">
          <div className="ts-overlay-card">
            <div className="ts-overlay-card__header">
              <div>
                <span className="ts-badge">launch</span>
                <h2 className="ts-overlay-title">TypeShip</h2>
              </div>
              <span className="ts-chip">{activeLanguage.flag} {activeLanguage.label}</span>
            </div>

            <div className="ts-overlay-meta">
              <div className="ts-score-card">
                <span className="ts-stat__label">Time</span>
                <strong>{profile.sessionSeconds}s</strong>
              </div>
              <div className="ts-score-card">
                <span className="ts-stat__label">Context</span>
                <strong>{activeContext?.label || 'Words'}</strong>
              </div>
              <div className="ts-score-card">
                <span className="ts-stat__label">Flow</span>
                <strong>adaptive</strong>
              </div>
            </div>

            <div className="ts-overlay-actions">
              <button className="ts-primary-button" onClick={startGame}>start run</button>
              <button className="ts-secondary-button" onClick={onExit}>menu</button>
            </div>
          </div>
        </div>
      ) : null}

      {isPaused && isGameActive && !gameOver ? (
        <div className="ts-overlay">
          <div className="ts-overlay-card">
            <span className="ts-badge">pause</span>
            <h2 className="ts-overlay-title" style={{ marginTop: 14 }}>Paused</h2>
            <div className="ts-overlay-actions">
              <button className="ts-primary-button" onClick={togglePause}>resume</button>
              <button className="ts-secondary-button" onClick={onExit}>menu</button>
            </div>
          </div>
        </div>
      ) : null}

      {gameOver ? (
        <div className="ts-overlay">
          <div className="ts-overlay-card">
            <div className="ts-overlay-card__header">
              <div>
                <span className="ts-badge">result</span>
                <h2 className="ts-overlay-title" style={{ marginTop: 14 }}>{gameOverReason}</h2>
              </div>
              <span className="ts-chip">{playerName?.trim() || localStorage.getItem('typingGamePlayerName') || 'anon'}</span>
            </div>

            <div className="ts-score-grid ts-score-grid--compact">
              <div className="ts-score-card">
                <span className="ts-stat__label">Destroyed</span>
                <strong>{destroyed}</strong>
              </div>
              <div className="ts-score-card">
                <span className="ts-stat__label">Best streak</span>
                <strong>{bestStreak}</strong>
              </div>
              <div className="ts-score-card">
                <span className="ts-stat__label">WPM</span>
                <strong>{wpm}</strong>
              </div>
              <div className="ts-score-card">
                <span className="ts-stat__label">Accuracy</span>
                <strong>{accuracy}%</strong>
              </div>
            </div>

            <div className="ts-scoreboard">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div key={`${entry.id}-${index}`} className={`ts-scoreboard__row ${entry.highlight ? 'is-highlight' : ''}`}>
                  <strong>#{index + 1}</strong>
                  <span>{entry.name}</span>
                  <span>{entry.wpm} WPM</span>
                  <span>{entry.accuracy}%</span>
                </div>
              ))}
            </div>

            <div className="ts-score-actions">
              <button className="ts-primary-button" onClick={startGame}>replay</button>
              <button className="ts-secondary-button" onClick={onExit}>menu</button>
            </div>
          </div>
        </div>
      ) : null}
    </SpaceBackdrop>
  );
};

export default GameScreen;
