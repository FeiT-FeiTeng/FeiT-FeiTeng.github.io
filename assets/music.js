"use strict";

(() => {
  const player = document.querySelector(".music-player");
  const audio = document.querySelector("#background-music");
  if (!player || !audio?.dataset.src?.trim()) return;

  const toggle = document.querySelector("#music-toggle");
  const panel = document.querySelector("#music-panel");
  const play = document.querySelector("#music-play");
  const volume = document.querySelector("#music-volume");
  const volumeValue = document.querySelector("#music-volume-value");
  const status = document.querySelector("#music-status");
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let context;
  let gain;
  let wantsPlayback = false;
  let attempt = 0;

  document.querySelector("#music-title").textContent =
    audio.dataset.title || "Background music";
  document.querySelector("#music-artist").textContent = audio.dataset.artist;
  player.hidden = false;

  function syncControls() {
    const command = wantsPlayback ? "Pause" : "Play";
    [toggle, play].forEach((button) => {
      button.setAttribute("aria-pressed", String(wantsPlayback));
      button.setAttribute("aria-label", `${command} background music`);
      button.title = `${command} background music`;
    });
    play.innerHTML = `<i data-lucide="${wantsPlayback ? "pause" : "play"}" aria-hidden="true"></i>`;
    window.lucide?.createIcons();
  }

  function setGain(value, duration = 0) {
    if (!gain) return;
    const now = context.currentTime;
    const current = gain.gain.value;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(duration ? current : value, now);
    if (duration) gain.gain.linearRampToValueAtTime(value, now + duration);
  }

  function pause() {
    wantsPlayback = false;
    attempt += 1;
    setGain(0);
    audio.pause();
    syncControls();
  }

  function showError(message) {
    pause();
    status.textContent = message;
    status.hidden = false;
  }

  async function start() {
    if (document.hidden) return;
    if (!AudioContext) {
      showError("Music playback is unavailable in this browser.");
      return;
    }
    wantsPlayback = true;
    const request = ++attempt;
    status.hidden = true;
    syncControls();
    try {
      if (!context) {
        context = new AudioContext();
        gain = context.createGain();
        gain.gain.value = 0;
        const source = context.createMediaElementSource(audio);
        source.connect(gain);
        gain.connect(context.destination);
      }
      setGain(0);
      if (!audio.hasAttribute("src") || audio.error) audio.src = audio.dataset.src;
      const resume = context.resume();
      const playback = audio.play();
      await Promise.all([resume, playback]);
      if (request !== attempt) return;
      if (!wantsPlayback || document.hidden) {
        pause();
        return;
      }
      setGain(Number(volume.value) / 100, 3);
    } catch (error) {
      if (request !== attempt) return;
      showError("Unable to play music. Please try again.");
    }
  }

  function closePanel(returnFocus = false) {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener("click", () => {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    if (wantsPlayback) pause();
    else start();
  });
  play.addEventListener("click", () => {
    if (wantsPlayback) pause();
    else start();
  });
  volume.addEventListener("input", () => {
    const value = Math.max(0, Math.min(50, Number(volume.value)));
    volumeValue.textContent = `${value}%`;
    volume.setAttribute("aria-valuetext", `${value}%`);
    if (wantsPlayback) setGain(value / 100, 0.2);
  });
  document.querySelector("#music-close").addEventListener("click", () => closePanel(true));
  document.addEventListener("click", (event) => {
    if (!player.contains(event.target)) closePanel();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) closePanel(true);
  });
  document.querySelector(".menu-toggle")?.addEventListener("click", () => closePanel());
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
  });
  window.addEventListener("pagehide", pause);
  document.querySelectorAll("video").forEach((video) => {
    const stopForVideo = () => {
      if (!video.paused && !video.muted && video.volume > 0) pause();
    };
    video.addEventListener("play", stopForVideo);
    video.addEventListener("volumechange", stopForVideo);
  });
  audio.addEventListener("error", () => showError("Music is currently unavailable."));
  audio.addEventListener("play", () => {
    if (!wantsPlayback || document.hidden) pause();
  });
  audio.addEventListener("pause", () => {
    if (wantsPlayback && audio.paused) pause();
  });
})();
