// The things that happened -- named by the companion, not counted.
//
// A short list of what actually mattered between you two. It stays short
// because most conversations do not earn a name, which is what stops it
// becoming a log.

import { el } from '../../core/el';
import { dayLabel } from '../../core/time';
import type { Moment } from '../../friendship/moment';
import { t } from '../../i18n/current';

export function momentList(moments: Moment[]): HTMLElement {
  const strings = t();

  return el(
    'ul',
    { class: 'moments' },
    moments.length > 0
      ? moments.map((moment) =>
          el('li', { class: 'moment' }, [
            el('span', { class: 'moment-title', text: moment.title }),
            el('span', { class: 'moment-when', text: dayLabel(moment.at) }),
          ]),
        )
      : [el('li', { class: 'empty', text: strings.momentsEmpty })],
  );
}
