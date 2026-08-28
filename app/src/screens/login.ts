// The way in.
//
// Two shapes, one form: with a Supabase project it is email + password;
// without one it is a name and a device PIN, so the app is usable before
// the project exists. The copy changes; the flow does not.

import { hasLocalAccount } from '../auth/local-account';
import { signIn } from '../auth/sign-in';
import { signUp } from '../auth/sign-up';
import type { User } from '../auth/user';
import { isCloudConfigured } from '../config/supabase-config';
import { el } from '../core/el';
import type { Screen } from '../core/mount';
import { toast } from '../ui/toast';

export function loginScreen(onSignedIn: (user: User) => void): Screen {
  // Returning to a device that already has an account should not open on
  // the sign-up form.
  let creating = isCloudConfigured ? false : !hasLocalAccount();

  const name = el('input', { class: 'field', type: 'text', name: 'name', placeholder: 'What should they call you?', autocomplete: 'nickname' });
  const email = el('input', { class: 'field', type: 'email', name: 'email', placeholder: 'you@email.com', autocomplete: 'email' });
  const secret = el('input', { class: 'field', type: 'password', name: 'password', autocomplete: 'current-password' });

  const submit = el('button', { class: 'primary', type: 'submit' });
  const swap = el('button', { class: 'link', type: 'button' });
  const note = el('p', { class: 'note' });

  function render(): void {
    name.hidden = !creating;
    email.hidden = !isCloudConfigured;
    secret.placeholder = isCloudConfigured ? 'Password' : 'A 4-digit PIN';
    secret.setAttribute('autocomplete', creating ? 'new-password' : 'current-password');
    submit.textContent = creating ? 'Create my account' : 'Come in';
    swap.textContent = creating ? 'I already have an account' : "I'm new here";
    note.textContent = isCloudConfigured
      ? ''
      : 'No account server is set up yet, so this stays on this device only. See SETUP.md.';
  }

  swap.addEventListener('click', () => {
    creating = !creating;
    render();
  });

  const form = el('form', { class: 'login-form' }, [name, email, secret, submit, swap, note]);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    submit.disabled = true;

    try {
      if (creating) {
        const result = await signUp(name.value.trim() || 'friend', email.value.trim(), secret.value);
        if (result.error) return toast(result.error);
        if (result.needsConfirmation) {
          return toast('Check your email to confirm the account, then come back and sign in.');
        }
        if (result.user) onSignedIn(result.user);
      } else {
        const result = await signIn(email.value.trim(), secret.value);
        if (result.error || !result.user) return toast(result.error ?? 'Could not sign in.');
        onSignedIn(result.user);
      }
    } finally {
      submit.disabled = false;
    }
  });

  render();

  const node = el('main', { class: 'screen screen-login' }, [
    el('div', { class: 'login-card' }, [
      el('h1', { class: 'wordmark', text: 'Stay With Me' }),
      el('p', { class: 'lede', text: 'Someone is awake. Pick who, and start talking.' }),
      form,
    ]),
  ]);

  return { node };
}
