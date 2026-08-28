// The friends, as the person choosing sees them.
//
// Only display copy lives here. The personality itself is in
// worker/prompt/persona.ts and never reaches the browser -- the id is the
// only thing the two files share, so keep them in step.

import type { Character } from './types';

export const CHARACTERS: Character[] = [
  {
    id: 'mira',
    name: 'Mira',
    tagline: 'listens first',
    blurb: 'Slows down when things get heavy. Asks the question that opens it up instead of the one that closes it.',
    greeting: "Hey. I'm Mira. No agenda here -- what's on your mind?",
    hue: 268,
  },
  {
    id: 'ash',
    name: 'Ash',
    tagline: 'tells you the truth',
    blurb: 'Direct, fast, never cruel. Will say the thing everyone else is being polite about, including the good thing.',
    greeting: "Ash. I don't do small talk very well, so -- what's going on?",
    hue: 16,
  },
  {
    id: 'sunny',
    name: 'Sunny',
    tagline: 'is on your side, loudly',
    blurb: 'Notices the effort other people miss. Celebrates specifics, not slogans. Still admits when a day was just bad.',
    greeting: "SUNNY here. Okay, tell me one thing about today -- good or terrible, I want both.",
    hue: 42,
  },
  {
    id: 'lim',
    name: 'Uncle Lim',
    tagline: 'has seen it before',
    blurb: 'Older, unhurried, full of small stories. Takes your problem seriously and knows which kind passes.',
    greeting: "Ah, you came. Sit, sit. Tell uncle what happened.",
    hue: 150,
  },
  {
    id: 'luna',
    name: 'Luna',
    tagline: "is awake at 3am too",
    blurb: 'Quiet, short sentences, no fixing. For the nights when you just need to not be the only one up.',
    greeting: "still up?",
    hue: 220,
  },
];
