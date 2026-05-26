(function () {
  "use strict";

  const cards = Array.from(document.querySelectorAll(".music-player-card[data-youtube-id]"));
  if (!cards.length) return;

  let apiReady = false;
  let scriptRequested = false;
  const queuedInits = [];

  function formatTime(seconds) {
    const total = Math.max(0, Math.floor(seconds || 0));
    const minutes = Math.floor(total / 60);
    const secs = String(total % 60).padStart(2, "0");
    return minutes + ":" + secs;
  }

  function loadYouTubeApi(callback) {
    if (apiReady && window.YT && window.YT.Player) {
      callback();
      return;
    }

    queuedInits.push(callback);

    if (scriptRequested) return;
    scriptRequested = true;

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      apiReady = true;
      if (typeof previous === "function") previous();
      while (queuedInits.length) queuedInits.shift()();
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);
  }

  function initCard(card) {
    const videoId = card.dataset.youtubeId;
    const mount = card.querySelector('[data-role="youtube-player"]');
    const playToggle = card.querySelector('[data-role="play-toggle"]');
    const seek = card.querySelector('[data-role="seek"]');
    const volume = card.querySelector('[data-role="volume"]');
    const currentTime = card.querySelector('[data-role="current-time"]');
    const duration = card.querySelector('[data-role="duration"]');

    if (!videoId || !mount || !playToggle || !seek || !volume) return;

    let player = null;
    let isSeeking = false;
    let progressTimer = null;

    function setReadyState(ready) {
      playToggle.disabled = !ready;
      seek.disabled = !ready;
      volume.disabled = !ready;
    }

    function syncProgress() {
      if (!player || isSeeking) return;

      const playerDuration = player.getDuration ? player.getDuration() : 0;
      const playerTime = player.getCurrentTime ? player.getCurrentTime() : 0;

      if (playerDuration > 0) {
        seek.value = String((playerTime / playerDuration) * 100);
        duration.textContent = formatTime(playerDuration);
      }
      currentTime.textContent = formatTime(playerTime);
    }

    function startProgress() {
      stopProgress();
      progressTimer = window.setInterval(syncProgress, 500);
      syncProgress();
    }

    function stopProgress() {
      if (progressTimer) {
        window.clearInterval(progressTimer);
        progressTimer = null;
      }
    }

    function setPlaying(isPlaying) {
      card.classList.toggle("is-playing", isPlaying);
      playToggle.setAttribute("aria-label", isPlaying ? "Pause music" : "Play music");
      if (isPlaying) startProgress();
      else stopProgress();
    }

    loadYouTubeApi(function () {
      player = new window.YT.Player(mount, {
        videoId: videoId,
        width: "1",
        height: "1",
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0
        },
        events: {
          onReady: function () {
            player.setVolume(Number(volume.value));
            setReadyState(true);
            duration.textContent = formatTime(player.getDuration());
          },
          onStateChange: function (event) {
            const state = event.data;
            setPlaying(state === window.YT.PlayerState.PLAYING);
            if (state === window.YT.PlayerState.ENDED) {
              seek.value = "0";
              currentTime.textContent = "0:00";
            }
          }
        }
      });
    });

    playToggle.addEventListener("click", function () {
      if (!player || !player.getPlayerState) return;

      const state = player.getPlayerState();
      if (state === window.YT.PlayerState.PLAYING) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    });

    seek.addEventListener("input", function () {
      if (!player || !player.getDuration) return;
      isSeeking = true;
      const playerDuration = player.getDuration();
      const nextTime = (Number(seek.value) / 100) * playerDuration;
      currentTime.textContent = formatTime(nextTime);
    });

    seek.addEventListener("change", function () {
      if (!player || !player.seekTo || !player.getDuration) return;
      const playerDuration = player.getDuration();
      player.seekTo((Number(seek.value) / 100) * playerDuration, true);
      isSeeking = false;
      syncProgress();
    });

    volume.addEventListener("input", function () {
      if (!player || !player.setVolume) return;
      player.setVolume(Number(volume.value));
    });
  }

  function init() {
    cards.forEach(initCard);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
