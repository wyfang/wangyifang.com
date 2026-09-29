(function () {
    var root = document.documentElement;
    var darkModeToggle = null;
    var isDarkMode = false;
    var userToggled = false;
    var transitionTimer = null;
    var themeColorFrame = null;
    var themeColorContext = null;
    var autoThemeTimer = null;
    var THEME_TRANSITION_MS = 2000;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function getThemeColorMeta() {
        return document.querySelector('meta[name="theme-color"]');
    }

    function getAutoDarkMode() {
        var hour = new Date().getHours();
        return !(hour > 6 && hour < 18);
    }

    function updateToggleText() {
        if (darkModeToggle) {
            darkModeToggle.textContent = isDarkMode ? "LIGHT MODE" : "DARK MODE";
        }
    }

    function getTopThemeColor(background, mask) {
        var baseColor = window.getComputedStyle(root).backgroundColor;
        if (!background || !mask) return baseColor;

        if (!themeColorContext) {
            var canvas = document.createElement('canvas');
            canvas.width = canvas.height = 1;
            themeColorContext = canvas.getContext('2d', { willReadFrequently: true });
        }
        if (!themeColorContext) return baseColor;

        // 手机屏幕顶端位于遮罩的纯色区，读取该层实际过渡中的颜色。
        var topColor = window.getComputedStyle(mask).getPropertyValue('--wifi-bg-mask-top-color').trim();
        if (!topColor) return baseColor;

        // 通过浏览器转换插值颜色（如 oklab），给 theme-color 写入通用的 sRGB。
        themeColorContext.globalAlpha = 1;
        themeColorContext.fillStyle = baseColor;
        themeColorContext.fillRect(0, 0, 1, 1);
        themeColorContext.globalAlpha = Number(window.getComputedStyle(background).opacity);
        themeColorContext.fillStyle = topColor;
        themeColorContext.fillRect(0, 0, 1, 1);
        var pixel = themeColorContext.getImageData(0, 0, 1, 1).data;
        return '#' + [pixel[0], pixel[1], pixel[2]].map(function (channel) {
            return ('0' + channel.toString(16)).slice(-2);
        }).join('');
    }

    function updateThemeColor(shouldAnimate) {
        window.cancelAnimationFrame(themeColorFrame);
        themeColorFrame = null;

        var themeColorMeta = getThemeColorMeta();
        if (!themeColorMeta) return;

        if (!shouldAnimate || document.hidden || reducedMotion.matches) {
            var targetColor = isDarkMode ? "#080C0F" : "#ECF1F3";
            if (themeColorMeta.content !== targetColor) {
                themeColorMeta.setAttribute('content', targetColor);
            }
            return;
        }

        var background = document.querySelector('.wifi-background');
        var mask = background && background.querySelector('.wifi-background__mask');

        function syncThemeColor() {
            if (document.hidden || reducedMotion.matches || !root.classList.contains('theme-transitioning')) {
                updateThemeColor(false);
                return;
            }

            var color = getTopThemeColor(background, mask);
            if (themeColorMeta.content !== color) {
                themeColorMeta.setAttribute('content', color);
            }
            themeColorFrame = window.requestAnimationFrame(syncThemeColor);
        }

        syncThemeColor();
    }

    function setTheme(nextIsDark, shouldAnimate) {
        var themeChanged = root.classList.contains("dark-mode") !== nextIsDark;

        isDarkMode = nextIsDark;

        if (themeChanged && shouldAnimate) {
            root.classList.add("theme-transitioning");
            window.clearTimeout(transitionTimer);
            transitionTimer = window.setTimeout(function () {
                root.classList.remove("theme-transitioning");
                updateThemeColor(false);
            }, THEME_TRANSITION_MS);
        }

        root.classList.toggle("dark-mode", isDarkMode);
        updateThemeColor(themeChanged && shouldAnimate);
        updateToggleText();
    }

    function checkTimeAndUpdateTheme() {
        if (userToggled) {
            return;
        }

        var nextMode = getAutoDarkMode();
        if (nextMode !== isDarkMode) setTheme(nextMode, true);
        scheduleAutoTheme();
    }

    function scheduleAutoTheme() {
        window.clearTimeout(autoThemeTimer);
        autoThemeTimer = null;
        if (userToggled || document.hidden) return;

        var now = new Date();
        var nextBoundary = new Date(now.getTime());
        var hour = now.getHours();

        if (hour < 7) {
            nextBoundary.setHours(7, 0, 0, 0);
        } else if (hour < 18) {
            nextBoundary.setHours(18, 0, 0, 0);
        } else {
            nextBoundary.setDate(nextBoundary.getDate() + 1);
            nextBoundary.setHours(7, 0, 0, 0);
        }

        autoThemeTimer = window.setTimeout(
            checkTimeAndUpdateTheme,
            Math.max(1, nextBoundary.getTime() - now.getTime())
        );
    }

    function bindToggle() {
        darkModeToggle = document.getElementById("darkModeToggle");

        if (darkModeToggle) {
            darkModeToggle.onclick = function () {
                userToggled = true;
                window.clearTimeout(autoThemeTimer);
                autoThemeTimer = null;
                setTheme(!isDarkMode, true);
            };
        }

        setTheme(isDarkMode, false);
    }

    isDarkMode = getAutoDarkMode();
    setTheme(isDarkMode, false);

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindToggle);
    } else {
        bindToggle();
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            window.clearTimeout(autoThemeTimer);
            autoThemeTimer = null;
            updateThemeColor(false);
        } else {
            checkTimeAndUpdateTheme();
            updateThemeColor(root.classList.contains('theme-transitioning'));
        }
    });

    scheduleAutoTheme();
})();
