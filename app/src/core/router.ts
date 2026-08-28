// Three screens, addressed by hash so the phone back button works.
//
//   #/login  #/friends  #/chat/mira

export type Route =
  | { name: 'login' }
  | { name: 'friends' }
  | { name: 'chat'; characterId: string };

export function currentRoute(): Route {
  const hash = location.hash.replace(/^#\/?/, '');
  const [head, tail] = hash.split('/');
  if (head === 'chat' && tail) return { name: 'chat', characterId: tail };
  if (head === 'friends') return { name: 'friends' };
  return { name: 'login' };
}

export function go(route: Route): void {
  const path =
    route.name === 'chat' ? `#/chat/${route.characterId}` : `#/${route.name}`;
  if (location.hash === path) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = path;
}

export function onRouteChange(handler: () => void): void {
  window.addEventListener('hashchange', handler);
}
