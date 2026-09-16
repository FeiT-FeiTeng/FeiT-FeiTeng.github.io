"use strict";

(() => {
  const papers = window.PUBLICATIONS || [];
  const firstAuthorRoles = new Set(["First author", "Co-first author"]);
  document.querySelectorAll("[data-focus-topics]").forEach((card) => {
    const topics = card.dataset.focusTopics.split(/\s+/);
    const matching = papers.filter((paper) => topics.includes(paper.topic));
    const firstAuthored = matching.filter((paper) =>
      firstAuthorRoles.has(paper.role),
    ).length;
    if (papers.length) {
      card.querySelector(".focus-count").textContent =
        `(${firstAuthored}/${matching.length})`;
    }
  });
  const featured = [
    {
      id: "19-Spheriverse",
      preview: "assets/previews/spheriverse",
      topic: "3D scene understanding",
      description:
        "A real-world benchmark and geometry-conditioned semantic evidence retrieval for understanding scenes in metric 3D space.",
      caption:
        "Spheriverse: spherical observations across urban streets, transport structures, rural roads, and agricultural landscapes. Original paper, Figure 1.",
    },
    {
      id: "13-Hallucinating-360",
      preview: "assets/previews/hallucinating-360",
      name: "Hallucinating 360\u00b0",
      topic: "Controllable image generation",
      description:
        "Local scene diffusion and probabilistic prompting turn stitched supervision into coherent, controllable panoramic street views.",
      caption:
        "Hallucinating 360\u00b0 / Percep360: BEV, text, and 2D prompts for panoramic street-view generation under different lighting and weather conditions.",
    },
    {
      id: "09-NRSeg",
      preview: "assets/previews/nrseg",
      topic: "Synthetic data learning",
      description:
        "Geometric consistency and uncertainty modeling improve BEV segmentation when learning from noisy synthetic driving data.",
      caption:
        "NRSeg: noise-resilient learning with synthetic driving data for BEV semantic segmentation. Original paper overview.",
    },
    {
      id: "05-QuaDreamer",
      preview: "assets/previews/quadreamer",
      topic: "Controllable video generation",
      description:
        "Object trajectories and vertical jitter guide panoramic video generation, with downstream evaluation on robot visual tracking.",
      caption:
        "QuaDreamer: panoramic video generation conditioned on trajectories and vertical jitter. Original paper overview.",
    },
    {
      id: "14-PS-MOT",
      preview: "assets/previews/ps-mot",
      name: "PS-MOT",
      topic: "Point-supervised object tracking",
      description:
        "Temporal pseudo-labels, boundary-aware features, and uncertainty-guided learning enable multi-object tracking from point annotations.",
      caption:
        "PS-MOT / PS-Track: point-to-instance learning through temporal-feedback prompting, point-excited wavelet attention, and uncertainty-guided Gaussian learning. Official project framework.",
    },
    {
      id: "17-LFX",
      preview: "assets/previews/lfx",
      topic: "Fine-grained visual perception",
      description:
        "Angular feature modulation preserves cross-view semantic consistency for segmentation and salient object detection across sub-aperture and focal-stack inputs.",
      caption:
        "LFX (v2): the FoP-ASM framework for semantic segmentation and salient object detection with sub-aperture images or focal stacks. Original paper framework.",
    },
  ];
  const icon = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
  const escapeHTML = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const refreshIcons = () => window.lucide?.createIcons();
  const external = 'target="_blank" rel="noopener noreferrer"';
  const featuredGrid = document.querySelector("#featured-grid");
  featuredGrid.innerHTML = featured
    .map((work) => {
      const paper = papers.find((item) => item.id === work.id);
      if (!paper) return "";
      const name = work.name || paper.name;
      return `<article class="work" id="work-${paper.id}" data-research-topic="${escapeHTML(paper.topic)}">
      <button type="button" class="work-media" data-figure="${paper.id}" aria-label="Enlarge ${escapeHTML(name)} research figure" title="Enlarge research figure">
        <img src="${work.preview}-640.webp"
          srcset="${work.preview}-640.webp 640w, ${work.preview}-1280.webp 1280w"
          sizes="(max-width: 720px) calc(100vw - 78px), (max-width: 1000px) calc(50vw - 89px), (max-width: 1216px) calc(50vw - 105px), 503px"
          alt="${escapeHTML(work.caption)}" width="1060" height="510"
          loading="lazy" decoding="async" fetchpriority="low">
        <span class="zoom-icon">${icon("maximize-2")}</span>
      </button>
      <div class="work-topline"><span class="work-topic">${escapeHTML(work.topic)}</span><span class="venue-label">${paper.preprint ? "Under review / " + paper.year : escapeHTML(paper.venue)}</span></div>
      <h3><a href="${escapeHTML(paper.url)}" ${external}>${escapeHTML(name)}</a></h3>
      <p class="work-description">${escapeHTML(work.description)}</p>
      <div class="work-bottom"><p class="work-role"><strong>${escapeHTML(paper.role)}</strong></p>
        <div class="work-links"><a href="${escapeHTML(paper.url)}" ${external}>${icon("file-text")}Paper</a>${paper.project ? `<a href="${escapeHTML(paper.project)}" ${external}>${icon("globe")}Project homepage</a>` : ""}${paper.code ? `<a href="${escapeHTML(paper.code)}" ${external}>${icon("github")}Code</a>` : ""}</div>
      </div>
    </article>`;
    })
    .join("");

  const search = document.querySelector("#paper-search");
  const year = document.querySelector("#paper-year");
  const topicButtons = [...document.querySelectorAll("[data-topic]")];
  const reset = document.querySelector("#reset-filters");
  let topic = "all";

  function renderPublications() {
    const topics = topic.split(/\s+/);
    const terms = search.value
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const filtered = papers.filter((paper) => {
      const haystack = [
        paper.name,
        paper.title,
        paper.authors.join(" "),
        paper.venue,
        paper.preprint ? "Under review" : "",
        paper.year,
      ]
        .join(" ")
        .toLowerCase();
      return (
        (topic === "all" || topics.includes(paper.topic)) &&
        (year.value === "all" || String(paper.year) === year.value) &&
        terms.every((term) => haystack.includes(term))
      );
    });
    document.querySelector("#publication-list").innerHTML = filtered
      .map((paper) => {
        const authors = paper.authors
          .map((author) =>
            author === "Fei Teng"
              ? "<strong>Fei Teng</strong>"
              : escapeHTML(author),
          )
          .join(", ");
        const venue = paper.preprint
          ? "Under review"
          : paper.venue.replace(/\s+20\d{2}/g, "");
        return `<article class="publication-row" data-paper-id="${paper.id}">
        <div class="publication-meta"><span class="publication-venue">${escapeHTML(venue)}</span><span class="publication-year">${paper.year}</span></div>
        <div class="publication-content"><h3><a href="${escapeHTML(paper.url)}" ${external}>${escapeHTML(paper.title)}</a></h3><p class="publication-authors">${authors}</p>
          <div class="publication-extra">${paper.role !== "Co-author" ? `<span class="publication-role">${escapeHTML(paper.role)}</span>` : ""}<a href="${escapeHTML(paper.url)}" ${external}>${icon("file-text")}Paper</a>${paper.project ? `<a href="${escapeHTML(paper.project)}" ${external}>${icon("globe")}Project homepage</a>` : ""}${paper.code ? `<a href="${escapeHTML(paper.code)}" ${external}>${icon("github")}Code</a>` : ""}${paper.supplement ? `<a href="${escapeHTML(paper.supplement)}" ${external}>${icon("paperclip")}Supplement</a>` : ""}</div>
        </div>
        <a class="publication-open" href="${escapeHTML(paper.url)}" ${external} aria-label="Open ${escapeHTML(paper.name)} paper" title="Open paper">${icon("arrow-up-right")}</a>
      </article>`;
      })
      .join("");
    document.querySelector("#result-count").textContent =
      `${filtered.length} of ${papers.length} publications`;
    document.querySelector("#no-results").hidden = filtered.length > 0;
    reset.hidden =
      topic === "all" && year.value === "all" && search.value === "";
    refreshIcons();
  }
  search.addEventListener("input", renderPublications);
  year.addEventListener("change", renderPublications);
  topicButtons.forEach((button) =>
    button.addEventListener("click", () => {
      topic = button.dataset.topic;
      topicButtons.forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
      renderPublications();
    }),
  );
  reset.addEventListener("click", () => {
    search.value = "";
    year.value = "all";
    topic = "all";
    topicButtons.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.topic === "all"),
      ),
    );
    renderPublications();
    search.focus();
  });

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#navigation");
  function closeMenu() {
    navigation.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    menuButton.title = "Open navigation";
  }
  menuButton.addEventListener("click", () => {
    const open = navigation.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    menuButton.title = open ? "Close navigation" : "Open navigation";
  });
  navigation
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));
  document.querySelector(".wordmark").addEventListener("click", closeMenu);
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("open")) {
      closeMenu();
      menuButton.focus();
    }
  });
  matchMedia("(min-width: 1001px)").addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });

  const demoVideos = [...document.querySelectorAll(".demo-card video")];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const videoStates = new Map();
  const clock = (seconds) => {
    const value = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
    return (
      String(Math.floor(value / 60)).padStart(2, "0") +
      ":" +
      String(value % 60).padStart(2, "0")
    );
  };
  const autoplayAllowed = () =>
    !reducedMotion.matches && !navigator.connection?.saveData;
  function syncPlayback(video) {
    const state = videoStates.get(video);
    if (!state.visible || document.hidden) {
      video.pause();
    } else if (!state.userPaused && !state.failed && autoplayAllowed()) {
      video
        .play()
        .then(() => {
          if (
            !state.visible ||
            document.hidden ||
            state.userPaused ||
            !autoplayAllowed()
          )
            video.pause();
        })
        .catch(() => {});
    }
  }
  demoVideos.forEach((video) => {
    const card = video.closest(".demo-card");
    const controls = card.querySelector(".video-controls");
    const name = card.querySelector("h3").textContent;
    const previewDuration = Number(video.dataset.duration);
    const state = { visible: false, userPaused: false, failed: false };
    videoStates.set(video, state);
    controls.innerHTML = `
      <button type="button" data-play aria-label="Play ${name}" title="Play ${name}">${icon("play")}</button>
      <button type="button" data-replay aria-label="Replay ${name}" title="Replay ${name}">${icon("rotate-ccw")}</button>
      <input type="range" min="0" max="1" step="1" value="0" disabled aria-label="Seek ${name}">
      <span class="video-time" aria-hidden="true"></span>
      <button type="button" data-fullscreen aria-label="Fullscreen ${name}" title="Fullscreen ${name}">${icon("maximize")}</button>`;
    controls.hidden = false;
    video.controls = false;
    const play = controls.querySelector("[data-play]");
    const seek = controls.querySelector("input");
    const fullscreen = controls.querySelector("[data-fullscreen]");
    const updatePlay = () => {
      const command = video.paused ? "Play" : "Pause";
      play.title = `${command} ${name}`;
      play.setAttribute("aria-label", play.title);
      play.innerHTML = icon(video.paused ? "play" : "pause");
      refreshIcons();
    };
    const updateTime = () => {
      const ready = Number.isFinite(video.duration) && video.duration > 0;
      const duration = ready ? video.duration : previewDuration;
      const hasDuration = Number.isFinite(duration) && duration > 0;
      const totalTime = hasDuration ? clock(duration) : "--:--";
      seek.disabled = !ready || state.failed;
      seek.max = hasDuration ? duration : 1;
      if (!video.seeking) seek.value = video.currentTime;
      seek.setAttribute(
        "aria-valuetext",
        `${clock(video.currentTime)} of ${hasDuration ? totalTime : "unknown duration"}`,
      );
      controls.querySelector(".video-time").textContent =
        `${clock(video.currentTime)} / ${totalTime}`;
    };
    updateTime();
    play.addEventListener("click", () => {
      state.userPaused = !video.paused;
      if (state.userPaused) video.pause();
      else video.play().catch(updatePlay);
    });
    controls.querySelector("[data-replay]").addEventListener("click", () => {
      state.userPaused = false;
      video.currentTime = 0;
      video.play().catch(updatePlay);
    });
    seek.addEventListener("input", () => {
      if (Number.isFinite(video.duration))
        video.currentTime = Number(seek.value);
    });
    fullscreen.hidden = !card.requestFullscreen && !video.webkitEnterFullscreen;
    fullscreen.addEventListener("click", () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else if (card.requestFullscreen) card.requestFullscreen().catch(() => {});
      else video.webkitEnterFullscreen?.();
    });
    document.addEventListener("fullscreenchange", () => {
      const expanded = document.fullscreenElement === card;
      fullscreen.title = expanded ? "Exit fullscreen" : `Fullscreen ${name}`;
      fullscreen.setAttribute("aria-label", fullscreen.title);
      fullscreen.innerHTML = icon(expanded ? "minimize" : "maximize");
      refreshIcons();
    });
    video.addEventListener("play", updatePlay);
    video.addEventListener("pause", updatePlay);
    video.addEventListener("loadedmetadata", updateTime);
    video.addEventListener("durationchange", updateTime);
    video.addEventListener("emptied", updateTime);
    video.addEventListener("seeked", updateTime);
    video.addEventListener("timeupdate", updateTime);
    const showError = () => {
      state.failed = true;
      card.querySelector(".video-error").hidden = false;
      controls.querySelectorAll("button, input").forEach((control) => {
        control.disabled = true;
      });
    };
    video.addEventListener("error", showError);
    video
      .querySelector("source:last-of-type")
      ?.addEventListener("error", showError);
  });
  document.addEventListener("visibilitychange", () => {
    demoVideos.forEach(syncPlayback);
  });
  reducedMotion.addEventListener("change", () => {
    demoVideos.forEach((video) => {
      if (reducedMotion.matches) video.pause();
      else syncPlayback(video);
    });
  });
  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          videoStates.get(entry.target).visible =
            entry.isIntersecting && entry.intersectionRatio >= 0.2;
          syncPlayback(entry.target);
        });
      },
      { threshold: [0, 0.2] },
    );
    demoVideos.forEach((video) => videoObserver.observe(video));
  }

  const dialog = document.querySelector("#figure-dialog");
  let figureTrigger;
  featuredGrid.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-figure]");
    if (!trigger) return;
    const paper = papers.find((item) => item.id === trigger.dataset.figure);
    const work = featured.find((item) => item.id === paper.id);
    figureTrigger = trigger;
    document.querySelector("#figure-title").textContent = work.name || paper.name;
    document.querySelector("#figure-image").src = paper.image;
    document.querySelector("#figure-image").alt = work.caption;
    document.querySelector("#figure-caption").textContent = work.caption;
    document.querySelector("#figure-source").href = paper.url;
    dialog.showModal();
    document.body.classList.add("modal-open");
  });
  document
    .querySelector("#close-figure")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom)
    )
      dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    figureTrigger?.focus({ preventScroll: true });
  });

  const navLinks = [...document.querySelectorAll('#navigation a[href^="#"], .section-nav a[href^="#"]')];
  const sections = [...document.querySelectorAll("main > section[id]")];
  const sectionForHash = (hash) =>
    document.getElementById(hash.slice(1))?.closest("main > section[id]");
  let requestedSection = sectionForHash(location.hash);
  let scrollQueued = false;
  function updateNavigation() {
    const atBottom =
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 2;
    const requestedBounds = requestedSection?.getBoundingClientRect();
    const active = atBottom && requestedBounds?.top < innerHeight && requestedBounds.bottom > 64
      ? requestedSection
      : atBottom
      ? sections[sections.length - 1]
      : sections
          .filter((section) => section.getBoundingClientRect().top <= 140)
          .pop() || sections[0];
    navLinks.forEach((link) => {
      const selected =
        link.getAttribute("href") ===
        "#" + active.id;
      link.classList.toggle("active", selected);
      if (selected) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    scrollQueued = false;
  }
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (link) requestedSection = sectionForHash(link.getAttribute("href"));
    requestAnimationFrame(updateNavigation);
  });
  const clearRequestedSection = () => { requestedSection = null; };
  window.addEventListener("wheel", clearRequestedSection, { passive: true });
  window.addEventListener("touchstart", clearRequestedSection, { passive: true });
  document.addEventListener("pointerdown", clearRequestedSection);
  document.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
      clearRequestedSection();
    }
  });
  window.addEventListener("hashchange", () => {
    requestedSection = sectionForHash(location.hash);
    updateNavigation();
  });
  window.addEventListener("resize", updateNavigation);
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollQueued) {
        scrollQueued = true;
        requestAnimationFrame(updateNavigation);
      }
    },
    { passive: true },
  );
  renderPublications();
  updateNavigation();

  if (
    location.protocol === "https:" &&
    location.hostname === "feit-feiteng.github.io" &&
    !location.port &&
    ["/", "/index.html"].includes(location.pathname)
  ) {
    const counterScript = document.createElement("script");
    counterScript.src =
      "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
    counterScript.async = true;
    document.head.appendChild(counterScript);
  }
})();
