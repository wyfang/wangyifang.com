(function () {
    var linksContainer = document.querySelector('.wifi-links');
    if (!linksContainer) return;

    var handledImages = new WeakSet();
    var revealingImages = new WeakSet();
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function timeToMilliseconds(value) {
        value = value.trim();
        return value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000;
    }

    function getOpacityTransitionTime(img) {
        var style = window.getComputedStyle(img);
        var properties = style.transitionProperty.split(',');
        var durations = style.transitionDuration.split(',');
        var delays = style.transitionDelay.split(',');
        var longest = 0;

        properties.forEach(function (property, index) {
            if (property.trim() !== 'opacity' && property.trim() !== 'all') return;

            var duration = durations[index % durations.length];
            var delay = delays[index % delays.length];
            longest = Math.max(longest, timeToMilliseconds(duration) + timeToMilliseconds(delay));
        });

        return longest;
    }

    function showImageImmediately(img) {
        var wrapper = img.closest('.wifi-link-img');
        if (!wrapper || revealingImages.has(img)) return;

        revealingImages.add(img);
        wrapper.classList.add('is-loaded', 'is-settled');
    }

    function revealImage(img) {
        var wrapper = img.closest('.wifi-link-img');
        if (!wrapper || revealingImages.has(img)) return;
        revealingImages.add(img);

        if (reduceMotion.matches) {
            wrapper.classList.add('is-loaded', 'is-settled');
            return;
        }

        // 真正等待网络的图片先绘制占位色，再开始 SVG 淡入。
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                var fallbackTimer;

                function settlePlaceholder() {
                    window.clearTimeout(fallbackTimer);
                    img.removeEventListener('transitionend', onImageTransitionEnd);
                    wrapper.classList.add('is-settled');
                }

                function onImageTransitionEnd(event) {
                    if (event.propertyName === 'opacity') settlePlaceholder();
                }

                img.addEventListener('transitionend', onImageTransitionEnd);
                wrapper.classList.add('is-loaded');

                // 根据 CSS 的真实时长兜底，后续调整动画速度也不会失去同步。
                fallbackTimer = window.setTimeout(
                    settlePlaceholder,
                    getOpacityTransitionTime(img) + 100
                );
            });
        });
    }

    function keepPlaceholder(img) {
        var wrapper = img.closest('.wifi-link-img');
        if (wrapper) wrapper.classList.remove('is-loaded', 'is-settled');
    }

    function handleImg(img) {
        if (!img || handledImages.has(img)) return;
        handledImages.add(img);

        img.addEventListener('load', function () {
            revealImage(img);
        }, { once: true });

        img.addEventListener('error', function () {
            keepPlaceholder(img);
        }, { once: true });

        if (img.complete) {
            // 刷新时已缓存完成的图片直接显示，避免所有图标重复动画造成闪动。
            if (img.naturalWidth !== 0) showImageImmediately(img);
            else keepPlaceholder(img);
        }
    }

    linksContainer.querySelectorAll('.wifi-link-img img').forEach(handleImg);

    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (node.nodeType !== 1) return;

                if (node.matches('.wifi-link-img img')) handleImg(node);
                node.querySelectorAll('.wifi-link-img img').forEach(handleImg);
            });
        });
    });

    observer.observe(linksContainer, { childList: true, subtree: true });
})();
