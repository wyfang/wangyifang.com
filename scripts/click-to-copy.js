(function () {
    const feedback = document.getElementById('copy-feedback');
    let feedbackTimer;
    let copyRequest = 0;

    function showFeedback(message) {
        if (!feedback) return;
        window.clearTimeout(feedbackTimer);
        // 重新添加文本，使连续复制同一内容也能被读屏器播报。
        feedback.replaceChildren(document.createTextNode(message));
        feedback.classList.add('is-visible');
        feedbackTimer = window.setTimeout(() => {
            feedback.classList.remove('is-visible');
        }, 2200);
    }

    document.querySelectorAll('[wificlick2copy]').forEach(element => {
        element.addEventListener('click', async () => {
            const request = ++copyRequest;
            try {
                if (!navigator.clipboard || !window.isSecureContext) {
                    throw new Error('Clipboard API unavailable');
                }
                await navigator.clipboard.writeText(element.getAttribute('wificlick2copy'));
                if (request === copyRequest) showFeedback('✓ 已复制');
            } catch {
                if (request === copyRequest) showFeedback('复制失败，请选中文字手动复制');
            }
        });
    });

    const previews = [];
    document.querySelectorAll('.wifi-text-qr').forEach((wrapper, index) => {
        const trigger = wrapper.querySelector('.wifi-text-qr-text');
        const preview = wrapper.querySelector('.wifi-qr');
        if (!trigger || !preview) return;

        preview.id = 'wifi-qr-' + index;
        trigger.setAttribute('aria-controls', preview.id);
        wrapper.classList.add('is-qr-managed');
        const qrImage = preview.querySelector('img');
        if (qrImage) qrImage.alt = trigger.textContent.trim() + ' 二维码';

        function setOpen(open) {
            wrapper.classList.toggle('is-qr-open', open);
            trigger.setAttribute('aria-expanded', String(open));
            preview.setAttribute('aria-hidden', String(!open));
        }
        setOpen(false);
        previews.push({ wrapper, setOpen });

        trigger.addEventListener('focus', () => setOpen(true));
        trigger.addEventListener('click', () => setOpen(true));
        wrapper.addEventListener('focusout', event => {
            if (!wrapper.contains(event.relatedTarget)) setOpen(false);
        });
        wrapper.addEventListener('pointerenter', event => {
            if (event.pointerType !== 'touch') setOpen(true);
        });
        wrapper.addEventListener('pointerleave', () => {
            if (!wrapper.contains(document.activeElement)) setOpen(false);
        });
    });

    document.addEventListener('click', event => {
        previews.forEach(({ wrapper, setOpen }) => {
            if (!wrapper.contains(event.target)) setOpen(false);
        });
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            previews.forEach(({ setOpen }) => setOpen(false));
        }
    });
})();
