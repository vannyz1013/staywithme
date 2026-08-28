// What this companion knows about you -- and the two things you can do to
// any line of it.
//
// Memory you cannot correct or delete is not memory, it is a record being
// kept on you. That is the whole reason this list is editable.

import { el } from '../../core/el';
import { t } from '../../i18n/current';
import { editMemory, forgetMemory } from '../../memory/edit';
import type { Fact } from '../../repo/types';

export interface FactList {
  node: HTMLElement;
  show(facts: Fact[]): void;
}

export function factList(userId: string, characterId: string): FactList {
  const strings = t();
  const node = el('ul', { class: 'facts' });

  function empty(): HTMLElement {
    return el('li', { class: 'empty', text: strings.knowsEmpty });
  }

  function row(fact: Fact): HTMLElement {
    const text = el('span', { class: 'fact-text', text: fact.text });

    const item = el('li', { class: 'fact' }, [
      text,
      el('span', { class: 'fact-actions' }, [
        el('button', {
          class: 'link',
          type: 'button',
          text: strings.edit,
          onclick: async () => {
            const next = prompt(strings.edit, fact.text);
            if (next === null) return;
            const tidy = next.trim();
            if (!tidy || tidy === fact.text) return;
            await editMemory(userId, characterId, fact.id, tidy);
            text.textContent = tidy;
          },
        }),
        el('button', {
          class: 'link link-danger',
          type: 'button',
          text: strings.deleteIt,
          onclick: async () => {
            await forgetMemory(userId, characterId, fact.id);
            item.remove();
            if (!node.firstChild) node.append(empty());
          },
        }),
      ]),
    ]);

    return item;
  }

  return {
    node,
    show(facts: Fact[]) {
      node.replaceChildren(...(facts.length > 0 ? facts.map(row) : [empty()]));
    },
  };
}
