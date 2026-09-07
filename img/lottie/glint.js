(function () {
    const container = document.getElementById('glint');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!container || reducedMotion.matches) return;

    function scheduleAnimation() {
        if (!window.bodymovin) return;
        window.setTimeout(() => {
            if (reducedMotion.matches) return;
            window.bodymovin.loadAnimation({
                container,
                renderer: 'svg',
                loop: false,
                autoplay: true,
                path: 'img/lottie/glint.json'
            });
        }, 5000);
    }

    if (window.bodymovin) {
        scheduleAnimation();
    } else {
        // 动画依赖独立加载，不阻塞页面解析和其他功能的初始化。
        const library = document.createElement('script');
        library.src = 'scripts/bodymovin.js';
        library.async = true;
        library.addEventListener('load', scheduleAnimation, { once: true });
        document.head.appendChild(library);
    }
})();
