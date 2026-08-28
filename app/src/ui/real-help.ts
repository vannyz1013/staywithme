// "Need a real person?"
//
// Reachable from every screen and never pushed into a conversation. The
// companion is somewhere to go when the people around you are busy -- this
// panel is the standing reminder that those people, and real services,
// still exist. The safety prompt handles genuine crises inside the
// conversation; this is the calm door that is always there.

import { el } from '../core/el';
import { t } from '../i18n/current';

const OPTIONS = [
  {
    icon: '👥',
    key: 'trustedPerson' as const,
    detail: 'The person you thought of just now. A message that says "are you free?" is enough to start.',
  },
  {
    icon: '📞',
    key: 'professional' as const,
    detail: 'Befrienders KL, 24 hours: 03-7627 2929. Talian Kasih, 24 hours: 15999. Your campus counselling service, if you have one.',
  },
  {
    icon: '🆘',
    key: 'urgent' as const,
    detail: 'If you are in danger right now, call 999, or Befrienders KL on 03-7627 2929. They pick up at any hour.',
  },
];

export function realHelpPanel(onClose: () => void): HTMLElement {
  const strings = t();

  const panel = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': strings.realPerson }, [
    el('div', { class: 'sheet-body' }, [
      el('h2', { class: 'sheet-title', text: strings.realPerson }),
      el('p', { class: 'sheet-lede', text: strings.realPersonWhy }),
      ...OPTIONS.map((option) =>
        el('div', { class: 'help-option' }, [
          el('span', { class: 'help-icon', text: option.icon, 'aria-hidden': 'true' }),
          el('div', {}, [
            el('strong', { text: strings[option.key] }),
            el('p', { class: 'help-detail', text: option.detail }),
          ]),
        ]),
      ),
      el('button', { class: 'primary', type: 'button', text: strings.cancel, onclick: onClose }),
    ]),
  ]);

  panel.addEventListener('click', (event) => {
    // Clicking the dimmed area closes it; clicking the card does not.
    if (event.target === panel) onClose();
  });

  return panel;
}
