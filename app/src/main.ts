// Boot. Works out who is signed in, then keeps the screen in step with the
// hash. Nothing else happens here -- each screen owns itself.

import { signOut } from './auth/sign-out';
import { currentUser } from './auth/session';
import type { User } from './auth/user';
import { getCharacter } from './characters/get';
import { loadProfiles } from './characters/load-profiles';
import type { FriendProfile } from './characters/profile';
import { resolve } from './characters/resolve';
import { mount } from './core/mount';
import { currentRoute, go, onRouteChange } from './core/router';
import { aboutScreen } from './screens/about';
import { chatScreen } from './screens/chat';
import { friendsScreen } from './screens/choose-character';
import { loginScreen } from './screens/login';
import './styles/base.css';
import './styles/login.css';
import './styles/friends.css';
import './styles/chat.css';
import './styles/about.css';
import './styles/sheet.css';

const root = document.getElementById('app');
if (!root) throw new Error('#app is missing from index.html');

let user: User | null = null;
// Cached because three screens need it and it is one round trip. Refreshed
// whenever the friend editor saves.
let profiles: Record<string, FriendProfile> = {};

/** The character as this person has made them, or null if the id is junk. */
function friend(characterId: string) {
  const character = getCharacter(characterId);
  return character ? resolve(character, profiles[characterId]) : null;
}

async function render(): Promise<void> {
  if (!root) return;

  if (!user) {
    mount(root, loginScreen((signedIn) => {
      user = signedIn;
      go({ name: 'friends' });
    }));
    return;
  }

  const route = currentRoute();

  if (route.name === 'chat' || route.name === 'about') {
    const character = friend(route.characterId);
    if (!character) return go({ name: 'friends' });

    if (route.name === 'chat') {
      return mount(root, chatScreen(user, character, {
        onBack: () => go({ name: 'friends' }),
        onOpenAbout: () => go({ name: 'about', characterId: character.id }),
      }));
    }

    return mount(root, aboutScreen(user, character, {
      onBack: () => go({ name: 'chat', characterId: character.id }),
      onChanged: async () => {
        profiles = await loadProfiles(user!.id);
        go({ name: 'about', characterId: character.id });
      },
    }));
  }

  mount(root, friendsScreen(user, profiles, {
    onPick: (characterId) => go({ name: 'chat', characterId }),
    onRefresh: () => void render(),
    onSignOut: async () => {
      await signOut();
      user = null;
      profiles = {};
      go({ name: 'login' });
    },
  }));
}

onRouteChange(() => void render());

void currentUser().then(async (signedIn) => {
  user = signedIn;
  if (user) profiles = await loadProfiles(user.id);

  // A returning session landing on #/login should go straight through.
  if (user && currentRoute().name === 'login') go({ name: 'friends' });
  else await render();
});
