// What this companion knows about you, and what you two have.
//
// No score, no level, no bar -- section 12 of the brief, and the right call:
// familiarity shown as a list of what they actually know reads as a
// relationship, where a number reads as a game.

import type { User } from '../../auth/user';
import type { Character } from '../../characters/types';
import { clearHistory } from '../../chat/history';
import { el } from '../../core/el';
import type { Screen } from '../../core/mount';
import { statsFor } from '../../friendship/stats';
import { t } from '../../i18n/current';
import { repo } from '../../repo';
import { avatar } from '../../ui/avatar';
import { toast } from '../../ui/toast';
import { openEditor } from './edit-launcher';
import { factList } from './fact-list';
import { momentList } from './moment-list';
import { traitList } from './trait-list';

export interface AboutActions {
  onBack: () => void;
  /** Called after a save that may have changed the name, so callers redraw. */
  onChanged: () => void;
}

function panel(title: string, body: Node): HTMLElement {
  return el('section', { class: 'panel' }, [
    el('h2', { class: 'panel-title', text: title }),
    body,
  ]);
}

export function aboutScreen(user: User, character: Character, actions: AboutActions): Screen {
  const strings = t();

  const summary = el('p', { class: 'lede' });
  const facts = factList(user.id, character.id);
  const moments = el('div');
  const traits = el('div');

  async function draw(): Promise<void> {
    const [messages, factRows, momentRows, traitRows] = await Promise.all([
      repo.messages(user.id, character.id),
      repo.memory(user.id, character.id),
      repo.moments(user.id, character.id),
      repo.traits(user.id, character.id),
    ]);

    const first = messages[0];
    const stats = statsFor(messages);
    summary.textContent = first
      ? `${strings.talkingSince} ${new Date(first.at).toLocaleDateString([], {
          day: 'numeric',
          month: 'long',
        })} · ${stats.conversations} ${
          stats.conversations === 1 ? strings.conversationsOne : strings.conversations
        }`
      : '';

    facts.show(factRows);
    moments.replaceChildren(momentList(momentRows));
    traits.replaceChildren(traitList(traitRows));
  }

  const node = el('main', { class: 'screen screen-about', style: `--hue:${character.hue}` }, [
    el('header', { class: 'about-header' }, [
      el(
        'button',
        { class: 'icon-button', type: 'button', 'aria-label': strings.back, onclick: actions.onBack },
        [el('span', { text: '←' })],
      ),
      avatar(character, 'lg'),
      el('div', {}, [el('h1', { class: 'wordmark', text: character.name }), summary]),
    ]),

    el('div', { class: 'about-body' }, [
      panel(strings.knows, facts.node),
      panel(strings.moments, moments),
      panel(strings.changed, traits),

      el('div', { class: 'about-actions' }, [
        el('button', {
          class: 'primary',
          type: 'button',
          text: strings.makeThemYours,
          onclick: () => void openEditor(user.id, character, node, actions.onChanged),
        }),
        el('button', {
          class: 'link link-danger',
          type: 'button',
          text: strings.startOver,
          onclick: async () => {
            if (!confirm(strings.startOverAsk)) return;
            await clearHistory(user.id, character.id);
            await draw();
            toast(strings.startOver);
          },
        }),
      ]),
    ]),
  ]);

  void draw();

  return { node };
}
