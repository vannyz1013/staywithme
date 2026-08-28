// Choosing who to talk to.

import type { User } from '../auth/user';
import { CHARACTERS } from '../characters/list';
import { el } from '../core/el';
import type { Screen } from '../core/mount';
import { characterCard } from '../ui/card';

export interface FriendsActions {
  onPick: (characterId: string) => void;
  onSignOut: () => void;
}

export function friendsScreen(user: User, actions: FriendsActions): Screen {
  const node = el('main', { class: 'screen screen-friends' }, [
    el('header', { class: 'friends-header' }, [
      el('div', {}, [
        el('h1', { class: 'wordmark', text: 'Stay With Me' }),
        el('p', { class: 'lede', text: `Hey ${user.name}. Who do you want tonight?` }),
      ]),
      el('button', { class: 'link', type: 'button', text: 'Sign out', onclick: actions.onSignOut }),
    ]),
    el(
      'div',
      { class: 'card-grid' },
      CHARACTERS.map((character) => characterCard(character, actions.onPick)),
    ),
  ]);

  return { node };
}
