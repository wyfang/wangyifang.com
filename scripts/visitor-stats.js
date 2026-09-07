(function () {
    const container = document.getElementById('custom-widget');
    if (!container) return;

    function renderStats() {
        const widget = container.querySelector('.la-widget');
        if (!widget) return;

        const labels = ['今日访问人数', '今日访问量', '昨日访问人数', '昨日访问量', '本月访问量', '总访问量'];
        const content = widget.textContent.replace(/\s+/g, ' ');
        const stats = labels.map(label => {
            const match = content.match(new RegExp(label + '\\s*([\\d,]+)'));
            if (!match) return null;
            const value = label === '总访问量'
                ? (Number(match[1].replace(/,/g, '')) + 97774).toLocaleString()
                : match[1];
            return label + value;
        });
        // 等待小部件插入完整数据后再替换，不让空的中间节点结束监听。
        if (stats.some(value => value === null)) return;

        observer.disconnect();
        const output = document.createElement('div');
        output.textContent = stats.join('\u00a0\u00a0');
        container.replaceChildren(output);
        container.style.display = '';
    }

    const observer = new MutationObserver(renderStats);
    observer.observe(container, { childList: true, subtree: true, characterData: true });
    const script = document.getElementById('LA-DATA-WIDGET');
    if (script) {
        script.addEventListener('load', renderStats, { once: true });
        script.addEventListener('error', () => observer.disconnect(), { once: true });
    }
    renderStats();
})();
