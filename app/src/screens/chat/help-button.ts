// The quiet door to real people.
//
// Present on every conversation, never raised by the companion itself. The
// point of the app is somewhere to go when the people around you are busy --
// not somewhere to go instead of them.

import { el } from '../../core/el';
import { t } from '../../i18n/current';
import { realHelpPanel } from '../../ui/real-help';

export function helpButton(mountInto: () => HTMLElement): HTMLElement {
  return el('button', {
    class: 'help-link',
    type: 'button',
    text: t().realPerson,
    onclick: () => {
      const sheet = realHelpPanel(() => sheet.remove());
      mountInto().append(sheet);
    },
  });
}
