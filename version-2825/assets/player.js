(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (box) {
        var video = box.querySelector('video');
        var button = box.querySelector('[data-play-button]');
        if (!video) {
            return;
        }
        var src = video.getAttribute('data-src');
        if (src) {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            }
        }
        var play = function () {
            box.classList.add('is-started');
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        };
        if (button) {
            button.addEventListener('click', play);
        }
        video.addEventListener('play', function () {
            box.classList.add('is-started');
        });
    });
}());
