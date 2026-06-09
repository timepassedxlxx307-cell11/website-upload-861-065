(function () {
    var box = document.querySelector('[data-player]');

    if (!box) {
        return;
    }

    var video = box.querySelector('video');
    var button = box.querySelector('.play-layer');
    var stream = video ? video.getAttribute('data-stream') : '';
    var ready = false;
    var hls = null;

    function attachStream() {
        if (!video || ready || !stream) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
        } else {
            video.src = stream;
        }

        ready = true;
    }

    function playVideo() {
        attachStream();
        if (!video) {
            return;
        }
        var action = video.play();
        if (action && typeof action.catch === 'function') {
            action.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener('click', function () {
            playVideo();
        });
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (button) {
                button.classList.remove('is-hidden');
            }
        });
        video.addEventListener('loadedmetadata', function () {
            if (button && !video.paused) {
                button.classList.add('is-hidden');
            }
        });
    }
})();
