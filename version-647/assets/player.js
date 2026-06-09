(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.getElementById("movieVideo");
    var overlay = document.getElementById("playOverlay");

    if (!video || typeof currentVideoSource === "undefined") {
      return;
    }

    function bindSource() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = currentVideoSource;
        return;
      }

      if (typeof Hls !== "undefined" && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(currentVideoSource);
        hls.attachMedia(video);
        return;
      }

      video.src = currentVideoSource;
    }

    function playVideo() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    bindSource();

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 && overlay) {
        overlay.classList.remove("is-hidden");
      }
    });
  });
})();
