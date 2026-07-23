/**
 * Boost tutorial playback volume beyond the browser's default 100% cap.
 * Videos are also re-encoded louder; this adds a little extra headroom in-browser.
 */
(function () {
  const PLAYBACK_GAIN = 1.35;

  document.querySelectorAll('.tutorial-video').forEach((video) => {
    video.volume = 1;

    const boostOnPlay = () => {
      if (video.dataset.boosted === 'true') {
        return;
      }

      try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const source = context.createMediaElementSource(video);
        const gain = context.createGain();
        gain.gain.value = PLAYBACK_GAIN;
        source.connect(gain);
        gain.connect(context.destination);
        video.dataset.boosted = 'true';
      } catch (error) {
        // Fall back to native volume if Web Audio is unavailable.
        console.warn('Video volume boost unavailable:', error);
      }
    };

    video.addEventListener('play', boostOnPlay, { once: true });
  });

  function jumpToVideo(videoId, seconds) {
    const video = document.getElementById(videoId);
    const jumpTo = Number(seconds);

    if (!video || Number.isNaN(jumpTo)) {
      return;
    }

    const startAt = () => {
      video.currentTime = jumpTo;
      video.play().catch(() => {});
    };

    if (video.readyState >= 1) {
      startAt();
    } else {
      video.addEventListener('loadedmetadata', startAt, { once: true });
      video.load();
    }

    video.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  document.querySelectorAll('[data-jump-video]').forEach((element) => {
    element.addEventListener('click', (event) => {
      const videoId = element.getAttribute('data-jump-video');
      const jumpTo = element.getAttribute('data-jump-to');

      if (!videoId) {
        return;
      }

      // Side-nav anchors still scroll, then jump into the matching chapter.
      if (element.tagName === 'A') {
        // Allow hash navigation, then jump after scroll.
        window.setTimeout(() => jumpToVideo(videoId, jumpTo), 50);
        return;
      }

      event.preventDefault();
      jumpToVideo(videoId, jumpTo);
    });
  });

  const navLinks = Array.from(document.querySelectorAll('.side-nav-link[data-nav-section]'));
  const sectionIds = navLinks.map((link) => link.getAttribute('data-nav-section')).filter(Boolean);

  function setActiveNav(id) {
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('data-nav-section') === id);
    });
  }

  if ('IntersectionObserver' in window && sectionIds.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveNav(visible.target.id);
        }
      },
      {
        rootMargin: '-30% 0px -55% 0px',
        threshold: [0.1, 0.35, 0.6],
      }
    );

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) {
        observer.observe(section);
      }
    });
  }
})();
