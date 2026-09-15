"use strict";

(() => {
  const player = document.querySelector(".music-player");
  const audio = document.querySelector("#background-music");
  if (!player || !audio?.dataset.src?.trim()) return;

  const toggle = document.querySelector("#music-toggle");
  const volume = document.querySelector("#music-volume");
  const status = document.querySelector("#music-status");
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const maxVolume = 8;
  let context;
  let gain;
  let wantsPlayback = false;
  let pendingPlayback = false;
  let autoplayAttempted = false;
  let lastVolume = maxVolume;
  let fadeEndsAt = 0;
  let attempt = 0;

  function level() {
    return Math.max(0, Math.min(maxVolume, Number(volume.value) || 0));
  }

  function syncControls() {
    const audible = wantsPlayback && !audio.paused && context?.state === "running" && level() > 0;
    const label = audible ? "Mute Zoo" : "Play Zoo";
    toggle.setAttribute("aria-pressed", String(audible));
    toggle.setAttribute("aria-label", label);
    toggle.title = label;
    toggle.innerHTML = `<i data-lucide="${audible ? "volume-1" : "volume-x"}" aria-hidden="true"></i>`;
    volume.setAttribute("aria-valuetext", `${level()}%`);
    volume.title = `Volume: ${level()}%`;
    volume.style.setProperty("--volume-fill", `${level() / maxVolume * 100}%`);
    window.lucide?.createIcons();
  }

  function setGain(value, duration = 0) {
    if (!gain) return;
    const now = context.currentTime;
    const current = gain.gain.value;
    const target = Math.max(0, Math.min(maxVolume / 100, value));
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(duration ? current : target, now);
    if (duration) gain.gain.linearRampToValueAtTime(target, now + duration);
  }

  function pause() {
    wantsPlayback = false;
    pendingPlayback = false;
    attempt += 1;
    fadeEndsAt = 0;
    setGain(0);
    audio.pause();
    syncControls();
  }

  function showError(message) {
    pause();
    status.textContent = message;
  }

  async function start() {
    if (document.hidden || pendingPlayback) return;
    if (!AudioContext) {
      showError("Music playback is unavailable in this browser.");
      return;
    }
    wantsPlayback = true;
    pendingPlayback = true;
    const request = ++attempt;
    status.textContent = "";
    let resumeTimeout;
    try {
      if (!context) {
        context = new AudioContext();
        context.addEventListener("statechange", syncControls);
        gain = context.createGain();
        gain.gain.value = 0;
        const source = context.createMediaElementSource(audio);
        source.connect(gain);
        gain.connect(context.destination);
      }
      fadeEndsAt = 0;
      setGain(0);
      if (!audio.hasAttribute("src") || audio.error) audio.src = audio.dataset.src;
      const resume = Promise.race([
        context.resume(),
        new Promise((resolve, reject) => {
          resumeTimeout = setTimeout(() => reject(new DOMException("Audio activation timed out", "NotAllowedError")), 2500);
        }),
      ]);
      await Promise.all([resume, audio.play()]);
      if (request !== attempt) return;
      if (!wantsPlayback || context.state !== "running") {
        pause();
        return;
      }
      fadeEndsAt = context.currentTime + 3;
      setGain(level() / 100, 3);
      syncControls();
    } catch (error) {
      if (request !== attempt) return;
      showError(error.name === "NotAllowedError"
        ? "Automatic playback is blocked. Use the sound button to play music."
        : "Unable to play music. Please try again.");
    } finally {
      clearTimeout(resumeTimeout);
      if (request === attempt) pendingPlayback = false;
    }
  }

  function autoplay() {
    if (autoplayAttempted || document.hidden) return;
    autoplayAttempted = true;
    start();
  }

  function resumePlayback() {
    if (document.hidden) return;
    if (!autoplayAttempted) autoplay();
    else if (wantsPlayback && (audio.paused || context?.state !== "running")) start();
  }

  toggle.addEventListener("click", () => {
    autoplayAttempted = true;
    const playing = !audio.paused && context?.state === "running";
    if (wantsPlayback && (pendingPlayback || playing)) pause();
    else {
      if (level() === 0) volume.value = lastVolume;
      start();
    }
    syncControls();
  });
  volume.addEventListener("input", () => {
    autoplayAttempted = true;
    const value = level();
    volume.value = value;
    if (value === 0) pause();
    else {
      lastVolume = value;
      if (!wantsPlayback || audio.paused || context?.state !== "running") start();
      else if (fadeEndsAt > 0) setGain(value / 100, Math.max(0.15, fadeEndsAt - context.currentTime));
    }
    syncControls();
  });
  document.addEventListener("visibilitychange", resumePlayback);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) resumePlayback();
  });
  audio.addEventListener("error", () => showError("Music is currently unavailable."));
  audio.addEventListener("play", () => {
    if (!wantsPlayback) pause();
  });
  audio.addEventListener("pause", syncControls);

  player.hidden = false;
  syncControls();
  autoplay();
})();
