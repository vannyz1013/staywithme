// Four screens, addressed by hash so the phone back button works.
//
//   #/login  #/friends  #/chat/mira  #/about/mira

export type Route =
  | { name: 'login' }
  | { name: 'friends' }
  | { name: 'chat'; characterId: string }
  | { name: 'about'; characterId: string };

export function currentRoute(): Route {
  const hash = location.hash.replace(/^#\/?/, '');
  const [head, tail] = hash.split('/');

  if (head === 'chat' && tail) return { name: 'chat', characterId: tail };
  if (head === 'about' && tail) return { name: 'about', characterId: tail };
  if (head === 'friends') return { name: 'friends' };
  return { name: 'login' };
}

export function go(route: Route): void {
  const path =
    route.name === 'chat' || route.name === 'about'
      ? `#/${route.name}/${route.characterId}`
      : `#/${route.name}`;

  // Navigating to where you already are still has to redraw -- the language
  // picker and the friend editor both rely on it.
  if (location.hash === path) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = path;
}

export function onRouteChange(handler: () => void): void {
  window.addEventListener('hashchange', handler);
}
