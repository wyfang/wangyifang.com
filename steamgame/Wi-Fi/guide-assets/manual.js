document.querySelectorAll('[data-copy]').forEach((button) => {
  const label = button.textContent;
  button.addEventListener('click', async () => {
    const code = button.closest('.code-block').querySelector('pre');
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent = '已复制';
    } catch {
      button.textContent = '请选中文字复制';
    }
    window.setTimeout(() => { button.textContent = label; }, 2200);
  });
});
