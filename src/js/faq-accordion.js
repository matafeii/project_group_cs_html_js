const faqList = document.querySelector('.faq-list');

function setFaqState(item, isOpen) {
  const trigger = item.querySelector('.faq-btn');
  const panel = item.querySelector('.answer-text');

  if (!trigger || !panel) return;

  item.classList.toggle('is-active', isOpen);
  trigger.setAttribute('aria-expanded', String(isOpen));
  panel.hidden = !isOpen;
}

if (faqList) {
  const faqItems = [...faqList.querySelectorAll('.faq-item')];

  faqItems.forEach((item, index) => {
    const trigger = item.querySelector('.faq-btn');
    const panel = item.querySelector('.answer-text');

    if (!trigger || !panel) return;

    const triggerId = `faq-trigger-${index + 1}`;
    const panelId = `faq-panel-${index + 1}`;

    trigger.id = triggerId;
    trigger.setAttribute('aria-controls', panelId);
    trigger.setAttribute('aria-expanded', 'false');

    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', triggerId);

    setFaqState(item, false);

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-active');

      faqItems.forEach(faqItem => setFaqState(faqItem, false));
      setFaqState(item, !isOpen);
    });
  });
}
