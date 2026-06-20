
import { H as Hls } from './hls-dru42stk.js';

function initPlayer() {
    const frame = document.querySelector('[data-video-frame]');
    if (!frame) {
        return;
    }

    const video = frame.querySelector('video');
    const button = frame.querySelector('[data-play-button]');
    const status = frame.querySelector('[data-player-status]');
    const source = frame.dataset.stream;
    let loaded = false;
    let hlsInstance = null;

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function bindSource() {
        if (loaded || !source || !video) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            loaded = true;
            setStatus('播放源已加载。');
            return;
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus('播放源已加载。');
            });
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus('播放源加载失败，请稍后重试。');
                    if (hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                    }
                    loaded = false;
                }
            });
            loaded = true;
            return;
        }

        setStatus('当前浏览器不支持 HLS 播放。');
    }

    async function play() {
        bindSource();
        if (!video) {
            return;
        }
        try {
            await video.play();
            if (button) {
                button.classList.add('is-hidden');
            }
            setStatus('正在播放。');
        } catch (error) {
            setStatus('请再次点击播放，或检查浏览器自动播放设置。');
        }
    }

    if (button) {
        button.addEventListener('click', play);
    }

    if (video) {
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (button && video.currentTime === 0) {
                button.classList.remove('is-hidden');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', initPlayer);
