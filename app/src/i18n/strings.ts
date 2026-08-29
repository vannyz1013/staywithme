// Interface text, in the languages the app offers.
//
// English is the complete set and every other language falls back to it key
// by key, so a missing translation shows English rather than a blank button.
// Adding a language means adding a partial record here -- nothing else in
// the app needs to change.

import type { LanguageId } from './languages';
import { uiLanguage } from './languages';

export interface Strings {
  tagline: string;
  namePlaceholder: string;
  /** Local-only mode: any password the person chooses, no format rule. */
  pinPlaceholder: string;
  passwordPlaceholder: string;
  createAccount: string;
  comeIn: string;
  haveAccount: string;
  imNew: string;
  localOnly: string;
  whoTonight: string;
  signOut: string;
  say: string;
  back: string;
  startOver: string;
  startOverAsk: string;
  attach: string;
  videoFrames: string;
  rightNow: string;
  mood: string;
  energy: string;
  wantsAdvice: string;
  wantsCompany: string;
  yes: string;
  no: string;
  aboutFriend: string;
  knows: string;
  knowsEmpty: string;
  moments: string;
  momentsEmpty: string;
  changed: string;
  changedEmpty: string;
  talkingSince: string;
  /** Plural. Languages that do not inflect can set both to the same word. */
  conversations: string;
  conversationsOne: string;
  edit: string;
  save: string;
  cancel: string;
  deleteIt: string;
  makeThemYours: string;
  theirName: string;
  theirGender: string;
  theirAge: string;
  theirPattern: string;
  patternHint: string;
  realPerson: string;
  realPersonWhy: string;
  trustedPerson: string;
  professional: string;
  urgent: string;
  language: string;
}

const EN: Strings = {
  tagline: "Someone's here. Pick who, and start talking.",
  namePlaceholder: 'What should they call you?',
  pinPlaceholder: 'Enter any password',
  passwordPlaceholder: 'Password',
  createAccount: 'Create my account',
  comeIn: 'Come in',
  haveAccount: 'I already have an account',
  imNew: "I'm new here",
  localOnly: 'No account server is set up yet, so this stays on this device only.',
  whoTonight: 'Who do you feel like talking to?',
  signOut: 'Sign out',
  say: 'Say something...',
  back: 'Back',
  startOver: 'Start over',
  startOverAsk: 'Forget everything you two have said? This cannot be undone.',
  attach: 'Add a photo or video',
  videoFrames: "Videos can't be watched, so a few frames were sent instead.",
  rightNow: 'Right now',
  mood: 'Mood',
  energy: 'Energy',
  wantsAdvice: 'Wants advice',
  wantsCompany: 'Wants company',
  yes: 'yes',
  no: 'no',
  aboutFriend: 'About',
  knows: 'What they know about you',
  knowsEmpty: 'Nothing yet. It builds up as you talk.',
  moments: 'Things that happened',
  momentsEmpty: 'Nothing named yet.',
  changed: 'How they have changed',
  changedEmpty: 'Still getting to know you.',
  talkingSince: 'Talking since',
  conversations: 'conversations',
  conversationsOne: 'conversation',
  edit: 'Edit',
  save: 'Save',
  cancel: 'Cancel',
  deleteIt: 'Delete',
  makeThemYours: 'Make them yours',
  theirName: 'Call them',
  theirGender: 'Gender',
  theirAge: 'Age',
  theirPattern: 'How you want them to be',
  patternHint: 'Anything: quieter, funnier, calls me out more, speaks Manglish.',
  realPerson: 'Need a real person?',
  realPersonWhy: "This is somewhere to go when the people around you are busy -- not instead of them.",
  trustedPerson: 'Talk to someone you trust',
  professional: 'Get professional support',
  urgent: 'I need help right now',
  language: 'Language',
};

const MS: Partial<Strings> = {
  tagline: 'Ada orang di sini. Pilih siapa, dan mula berbual.',
  namePlaceholder: 'Nak dipanggil apa?',
  pinPlaceholder: 'Masukkan apa-apa kata laluan',
  passwordPlaceholder: 'Kata laluan',
  createAccount: 'Buat akaun saya',
  comeIn: 'Masuk',
  haveAccount: 'Saya sudah ada akaun',
  imNew: 'Saya baru di sini',
  whoTonight: 'Nak berbual dengan siapa?',
  signOut: 'Log keluar',
  say: 'Cakap sesuatu...',
  back: 'Kembali',
  startOver: 'Mula semula',
  startOverAsk: 'Lupakan semua yang kamu berdua cakap? Ini tidak boleh dibatalkan.',
  attach: 'Hantar gambar atau video',
  rightNow: 'Sekarang',
  mood: 'Perasaan',
  energy: 'Tenaga',
  wantsAdvice: 'Mahu nasihat',
  wantsCompany: 'Mahu ditemani',
  yes: 'ya',
  no: 'tidak',
  knows: 'Apa yang dia tahu tentang kamu',
  moments: 'Perkara yang berlaku',
  changed: 'Bagaimana dia berubah',
  talkingSince: 'Berbual sejak',
  conversations: 'perbualan',
  conversationsOne: 'perbualan',
  edit: 'Ubah',
  save: 'Simpan',
  cancel: 'Batal',
  deleteIt: 'Padam',
  makeThemYours: 'Jadikan dia milik kamu',
  theirName: 'Panggil dia',
  theirGender: 'Jantina',
  theirAge: 'Umur',
  theirPattern: 'Kamu nak dia macam mana',
  realPerson: 'Perlukan orang sebenar?',
  trustedPerson: 'Cakap dengan orang yang kamu percaya',
  professional: 'Dapatkan bantuan profesional',
  urgent: 'Saya perlukan bantuan sekarang',
  language: 'Bahasa',
};

const ZH: Partial<Strings> = {
  tagline: '有人在。选一个，然后聊聊。',
  namePlaceholder: '他们该怎么称呼你？',
  pinPlaceholder: '输入任意密码',
  passwordPlaceholder: '密码',
  createAccount: '创建账号',
  comeIn: '进来吧',
  haveAccount: '我已经有账号了',
  imNew: '我是新来的',
  whoTonight: '今天想跟谁聊？',
  signOut: '退出',
  say: '说点什么…',
  back: '返回',
  startOver: '重新开始',
  startOverAsk: '忘掉你们说过的一切？无法复原。',
  attach: '发照片或视频',
  rightNow: '此刻',
  mood: '心情',
  energy: '状态',
  wantsAdvice: '想要建议',
  wantsCompany: '想有人陪',
  yes: '是',
  no: '否',
  knows: '他们记得你的事',
  moments: '发生过的事',
  changed: '他们的变化',
  talkingSince: '开始聊天于',
  conversations: '次对话',
  conversationsOne: '次对话',
  edit: '修改',
  save: '保存',
  cancel: '取消',
  deleteIt: '删除',
  makeThemYours: '把他们变成你的',
  theirName: '叫他们',
  theirGender: '性别',
  theirAge: '年龄',
  theirPattern: '你希望他们是什么样',
  realPerson: '需要真人吗？',
  trustedPerson: '找一个你信任的人聊聊',
  professional: '寻求专业帮助',
  urgent: '我现在就需要帮助',
  language: '语言',
};

const TA: Partial<Strings> = {
  tagline: 'யாரோ இங்கே இருக்கிறார்கள். ஒருவரைத் தேர்ந்தெடுத்துப் பேசுங்கள்.',
  whoTonight: 'யாருடன் பேச விரும்புகிறீர்கள்?',
  say: 'ஏதாவது சொல்லுங்கள்...',
  back: 'பின்',
  yes: 'ஆம்',
  no: 'இல்லை',
  save: 'சேமி',
  cancel: 'ரத்து',
  deleteIt: 'நீக்கு',
  language: 'மொழி',
  realPerson: 'உண்மையான ஒருவர் தேவையா?',
};

const TABLES: Record<'en' | 'ms' | 'zh' | 'ta', Partial<Strings>> = {
  en: EN,
  ms: MS,
  zh: ZH,
  ta: TA,
};

/** Strings for a language, with English filling any gap. */
export function stringsFor(language: LanguageId): Strings {
  return { ...EN, ...TABLES[uiLanguage(language)] };
}
