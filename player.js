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
})();
