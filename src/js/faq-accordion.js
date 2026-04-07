import Accordion from 'accordion-js';
import 'accordion-js/dist/accordion.min.css';

const faqList = document.querySelector('.faq-list');

function syncFaqState(item) {
  const trigger = item.querySelector('.faq-btn');
  const panel = item.querySelector('.answer-text');
  const isActive = item.classList.contains('is-active');

  if (!trigger || !panel) return;

  trigger.setAttribute('aria-expanded', String(isActive));
  panel.hidden = !isActive;
}

if (faqList) {
  const faqItems = faqList.querySelectorAll('.faq-item');

  faqItems.forEach((item, index) => {
    const trigger = item.querySelector('.faq-btn');
    const panel = item.querySelector('.answer-text');

    if (!trigger || !panel) return;

    const triggerId = `faq-trigger-${index + 1}`;
    const panelId = `faq-panel-${index + 1}`;

    trigger.id = triggerId;
    trigger.setAttribute('aria-controls', panelId);
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', triggerId);

    syncFaqState(item);
  });

  new Accordion('.faq-list', {
    showMultiple: false,
    duration: 600,
    triggerClass: 'faq-btn',
    elementClass: 'faq-item',
    panelClass: 'answer-text',
    onOpen: currentElement => syncFaqState(currentElement),
    onClose: currentElement => syncFaqState(currentElement),
  });
}
