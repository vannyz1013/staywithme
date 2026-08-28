// Boot. Works out who is signed in, then keeps the screen in step with the
// hash. Nothing else happens here -- each screen owns itself.

import { signOut } from './auth/sign-out';
import { currentUser } from './auth/session';
import type { User } from './auth/user';
import { getCharacter } from './characters/get';
import { mount } from './core/mount';
import { currentRoute, go, onRouteChange } from './core/router';
import { chatScreen } from './screens/chat';
import { friendsScreen } from './screens/choose-character';
import { loginScreen } from './screens/login';
import './styles/base.css';
import './styles/login.css';
import './styles/friends.css';
import './styles/chat.css';

const root = document.getElementById('app');
if (!root) throw new Error('#app is missing from index.html');

let user: User | null = null;

function render(): void {
  if (!root) return;

  if (!user) {
    mount(root, loginScreen((signedIn) => {
      user = signedIn;
      go({ name: 'friends' });
    }));
    return;
  }

  const route = currentRoute();

  if (route.name === 'chat') {
    const character = getCharacter(route.characterId);
    if (!character) return go({ name: 'friends' });
    return mount(root, chatScreen(user, character, { onBack: () => go({ name: 'friends' }) }));
  }

  mount(root, friendsScreen(user, {
    onPick: (characterId) => go({ name: 'chat', characterId }),
    onSignOut: async () => {
      await signOut();
      user = null;
      go({ name: 'login' });
    },
  }));
}

onRouteChange(render);

void currentUser().then((signedIn) => {
  user = signedIn;
  // A returning session landing on #/login should go straight through.
  if (user && currentRoute().name === 'login') go({ name: 'friends' });
  else render();
});
