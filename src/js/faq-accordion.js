const faqList = document.querySelector('.faq-list');

function setFaqState(item, isOpen) {
  const trigger = item.querySelector('.faq-btn');
  const panel = item.querySelector('.answer-text');

  if (!trigger || !panel) return;

  item.classList.toggle('is-active', isOpen);
  trigger.setAttribute('aria-expanded', String(isOpen));
}

function openPanel(item) {
  const panel = item.querySelector('.answer-text');

  if (!panel) return;

  panel.hidden = false;
  panel.style.height = '0px';

  requestAnimationFrame(() => {
    panel.style.height = `${panel.scrollHeight}px`;
  });
}

function closePanel(item) {
  const panel = item.querySelector('.answer-text');

  if (!panel) return;

  panel.style.height = `${panel.scrollHeight}px`;

  requestAnimationFrame(() => {
    panel.style.height = '0px';
  });
}

function toggleFaq(item, faqItems) {
  const isOpen = item.classList.contains('is-active');

  faqItems.forEach(faqItem => {
    if (faqItem === item) return;

    setFaqState(faqItem, false);
    closePanel(faqItem);
  });

  if (isOpen) {
    setFaqState(item, false);
    closePanel(item);
    return;
  }

  setFaqState(item, true);
  openPanel(item);
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
    panel.hidden = true;
    panel.style.height = '0px';

    setFaqState(item, false);

    panel.addEventListener('transitionend', event => {
      if (event.propertyName !== 'height') return;

      if (item.classList.contains('is-active')) {
        panel.style.height = 'auto';
        return;
      }

      panel.hidden = true;
    });

    trigger.addEventListener('click', () => toggleFaq(item, faqItems));
  });
}
