/**
 * FA4-to-FA7 icon resolver (SVG approach — self-contained, no consumer FA dependency).
 *
 * Registers all free solid + regular icons in the FA library, then resolves
 * any FA4/FA5/FA6/FA7 icon name to an icon definition object for SVG rendering.
 *
 * Shim map generated from @fortawesome/fontawesome-free 7.2.0 metadata/shims.yml.
 * Only includes free solid (fas) and regular (far) icons — brand icons excluded.
 *
 * To regenerate (one-time, only needed when upgrading FA major version):
 *   1. npm install --no-save @fortawesome/fontawesome-free@<version>
 *   2. Parse metadata/shims.yml and update the SHIMS map below
 *   3. rm -rf node_modules/@fortawesome/fontawesome-free
 */
import { library, findIconDefinition } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

library.add(fas, far);

// FA4 icon names that were renamed or changed prefix in FA7
const SHIMS = {
  'area-chart': { prefix: 'fas', iconName: 'chart-area' },
  'arrow-circle-o-down': { prefix: 'far', iconName: 'circle-down' },
  'arrow-circle-o-left': { prefix: 'far', iconName: 'circle-left' },
  'arrow-circle-o-right': { prefix: 'far', iconName: 'circle-right' },
  'arrow-circle-o-up': { prefix: 'far', iconName: 'circle-up' },
  arrows: { prefix: 'fas', iconName: 'up-down-left-right' },
  'arrows-alt': { prefix: 'fas', iconName: 'maximize' },
  'arrows-h': { prefix: 'fas', iconName: 'left-right' },
  'arrows-v': { prefix: 'fas', iconName: 'up-down' },
  'asl-interpreting': { prefix: 'fas', iconName: 'hands-asl-interpreting' },
  automobile: { prefix: 'fas', iconName: 'car' },
  bank: { prefix: 'fas', iconName: 'building-columns' },
  'bar-chart': { prefix: 'fas', iconName: 'chart-column' },
  'bar-chart-o': { prefix: 'fas', iconName: 'chart-column' },
  bathtub: { prefix: 'fas', iconName: 'bath' },
  battery: { prefix: 'fas', iconName: 'battery-full' },
  'battery-0': { prefix: 'fas', iconName: 'battery-empty' },
  'battery-1': { prefix: 'fas', iconName: 'battery-quarter' },
  'battery-2': { prefix: 'fas', iconName: 'battery-half' },
  'battery-3': { prefix: 'fas', iconName: 'battery-three-quarters' },
  'battery-4': { prefix: 'fas', iconName: 'battery-full' },
  cab: { prefix: 'fas', iconName: 'taxi' },
  calendar: { prefix: 'fas', iconName: 'calendar-days' },
  'calendar-times-o': { prefix: 'far', iconName: 'calendar-xmark' },
  'caret-square-o-down': { prefix: 'far', iconName: 'square-caret-down' },
  'caret-square-o-left': { prefix: 'far', iconName: 'square-caret-left' },
  'caret-square-o-right': { prefix: 'far', iconName: 'square-caret-right' },
  'caret-square-o-up': { prefix: 'far', iconName: 'square-caret-up' },
  cc: { prefix: 'far', iconName: 'closed-captioning' },
  chain: { prefix: 'fas', iconName: 'link' },
  'chain-broken': { prefix: 'fas', iconName: 'link-slash' },
  'check-circle-o': { prefix: 'far', iconName: 'circle-check' },
  'check-square-o': { prefix: 'far', iconName: 'square-check' },
  'circle-o-notch': { prefix: 'fas', iconName: 'circle-notch' },
  'circle-thin': { prefix: 'far', iconName: 'circle' },
  clipboard: { prefix: 'fas', iconName: 'paste' },
  clone: { prefix: 'far', iconName: 'clone' },
  close: { prefix: 'fas', iconName: 'xmark' },
  'cloud-download': { prefix: 'fas', iconName: 'cloud-arrow-down' },
  'cloud-upload': { prefix: 'fas', iconName: 'cloud-arrow-up' },
  cny: { prefix: 'fas', iconName: 'yen-sign' },
  'code-fork': { prefix: 'fas', iconName: 'code-branch' },
  commenting: { prefix: 'fas', iconName: 'comment-dots' },
  'commenting-o': { prefix: 'far', iconName: 'comment-dots' },
  compass: { prefix: 'far', iconName: 'compass' },
  compress: { prefix: 'fas', iconName: 'down-left-and-up-right-to-center' },
  copyright: { prefix: 'far', iconName: 'copyright' },
  'credit-card': { prefix: 'far', iconName: 'credit-card' },
  'credit-card-alt': { prefix: 'fas', iconName: 'credit-card' },
  cut: { prefix: 'fas', iconName: 'scissors' },
  cutlery: { prefix: 'fas', iconName: 'utensils' },
  dashboard: { prefix: 'fas', iconName: 'gauge-high' },
  deafness: { prefix: 'fas', iconName: 'ear-deaf' },
  dedent: { prefix: 'fas', iconName: 'outdent' },
  diamond: { prefix: 'far', iconName: 'gem' },
  dollar: { prefix: 'fas', iconName: 'dollar-sign' },
  'dot-circle-o': { prefix: 'far', iconName: 'circle-dot' },
  'drivers-license': { prefix: 'fas', iconName: 'id-card' },
  'drivers-license-o': { prefix: 'far', iconName: 'id-card' },
  edit: { prefix: 'far', iconName: 'pen-to-square' },
  eur: { prefix: 'fas', iconName: 'euro-sign' },
  euro: { prefix: 'fas', iconName: 'euro-sign' },
  exchange: { prefix: 'fas', iconName: 'right-left' },
  expand: { prefix: 'fas', iconName: 'up-right-and-down-left-from-center' },
  'external-link': { prefix: 'fas', iconName: 'up-right-from-square' },
  'external-link-square': { prefix: 'fas', iconName: 'square-up-right' },
  eye: { prefix: 'far', iconName: 'eye' },
  'eye-slash': { prefix: 'far', iconName: 'eye-slash' },
  eyedropper: { prefix: 'fas', iconName: 'eye-dropper' },
  feed: { prefix: 'fas', iconName: 'rss' },
  'file-archive-o': { prefix: 'far', iconName: 'file-zipper' },
  'file-movie-o': { prefix: 'far', iconName: 'file-video' },
  'file-photo-o': { prefix: 'far', iconName: 'file-image' },
  'file-picture-o': { prefix: 'far', iconName: 'file-image' },
  'file-sound-o': { prefix: 'far', iconName: 'file-audio' },
  'file-text': { prefix: 'fas', iconName: 'file-lines' },
  'file-text-o': { prefix: 'far', iconName: 'file-lines' },
  'file-zip-o': { prefix: 'far', iconName: 'file-zipper' },
  'files-o': { prefix: 'far', iconName: 'copy' },
  flash: { prefix: 'fas', iconName: 'bolt' },
  'floppy-o': { prefix: 'far', iconName: 'floppy-disk' },
  'frown-o': { prefix: 'far', iconName: 'face-frown' },
  gbp: { prefix: 'fas', iconName: 'sterling-sign' },
  gear: { prefix: 'fas', iconName: 'gear' },
  gears: { prefix: 'fas', iconName: 'gears' },
  glass: { prefix: 'fas', iconName: 'martini-glass-empty' },
  globe: { prefix: 'fas', iconName: 'earth-americas' },
  group: { prefix: 'fas', iconName: 'users' },
  'hand-grab-o': { prefix: 'far', iconName: 'hand-back-fist' },
  'hand-o-down': { prefix: 'far', iconName: 'hand-point-down' },
  'hand-o-left': { prefix: 'far', iconName: 'hand-point-left' },
  'hand-o-right': { prefix: 'far', iconName: 'hand-point-right' },
  'hand-o-up': { prefix: 'far', iconName: 'hand-point-up' },
  'hand-paper-o': { prefix: 'far', iconName: 'hand' },
  'hand-rock-o': { prefix: 'far', iconName: 'hand-back-fist' },
  'hand-stop-o': { prefix: 'far', iconName: 'hand' },
  'hard-of-hearing': { prefix: 'fas', iconName: 'ear-deaf' },
  'hdd-o': { prefix: 'far', iconName: 'hard-drive' },
  header: { prefix: 'fas', iconName: 'heading' },
  home: { prefix: 'fas', iconName: 'house' },
  hotel: { prefix: 'fas', iconName: 'bed' },
  'hourglass-1': { prefix: 'fas', iconName: 'hourglass-start' },
  'hourglass-2': { prefix: 'fas', iconName: 'hourglass-half' },
  'hourglass-3': { prefix: 'fas', iconName: 'hourglass-end' },
  'hourglass-o': { prefix: 'fas', iconName: 'hourglass' },
  'id-badge': { prefix: 'far', iconName: 'id-badge' },
  ils: { prefix: 'fas', iconName: 'shekel-sign' },
  image: { prefix: 'far', iconName: 'image' },
  inr: { prefix: 'fas', iconName: 'indian-rupee-sign' },
  institution: { prefix: 'fas', iconName: 'building-columns' },
  intersex: { prefix: 'fas', iconName: 'mars-and-venus' },
  jpy: { prefix: 'fas', iconName: 'yen-sign' },
  krw: { prefix: 'fas', iconName: 'won-sign' },
  legal: { prefix: 'fas', iconName: 'gavel' },
  'level-down': { prefix: 'fas', iconName: 'turn-down' },
  'level-up': { prefix: 'fas', iconName: 'turn-up' },
  'life-bouy': { prefix: 'fas', iconName: 'life-ring' },
  'life-buoy': { prefix: 'fas', iconName: 'life-ring' },
  'life-saver': { prefix: 'fas', iconName: 'life-ring' },
  'line-chart': { prefix: 'fas', iconName: 'chart-line' },
  'list-alt': { prefix: 'far', iconName: 'rectangle-list' },
  'long-arrow-down': { prefix: 'fas', iconName: 'down-long' },
  'long-arrow-left': { prefix: 'fas', iconName: 'left-long' },
  'long-arrow-right': { prefix: 'fas', iconName: 'right-long' },
  'long-arrow-up': { prefix: 'fas', iconName: 'up-long' },
  magic: { prefix: 'fas', iconName: 'wand-magic-sparkles' },
  'mail-forward': { prefix: 'fas', iconName: 'share' },
  'mail-reply': { prefix: 'fas', iconName: 'reply' },
  'mail-reply-all': { prefix: 'fas', iconName: 'reply-all' },
  'map-marker': { prefix: 'fas', iconName: 'location-dot' },
  'meh-o': { prefix: 'far', iconName: 'face-meh' },
  'minus-square-o': { prefix: 'far', iconName: 'square-minus' },
  mobile: { prefix: 'fas', iconName: 'mobile-screen-button' },
  'mobile-phone': { prefix: 'fas', iconName: 'mobile-screen-button' },
  money: { prefix: 'fas', iconName: 'money-bill-1' },
  'mortar-board': { prefix: 'fas', iconName: 'graduation-cap' },
  navicon: { prefix: 'fas', iconName: 'bars' },
  'object-group': { prefix: 'far', iconName: 'object-group' },
  'object-ungroup': { prefix: 'far', iconName: 'object-ungroup' },
  'pause-circle-o': { prefix: 'far', iconName: 'circle-pause' },
  'pencil-square': { prefix: 'fas', iconName: 'square-pen' },
  'pencil-square-o': { prefix: 'far', iconName: 'pen-to-square' },
  photo: { prefix: 'far', iconName: 'image' },
  'picture-o': { prefix: 'far', iconName: 'image' },
  'pie-chart': { prefix: 'fas', iconName: 'chart-pie' },
  'play-circle-o': { prefix: 'far', iconName: 'circle-play' },
  'plus-square-o': { prefix: 'far', iconName: 'square-plus' },
  'question-circle-o': { prefix: 'far', iconName: 'circle-question' },
  refresh: { prefix: 'fas', iconName: 'arrows-rotate' },
  registered: { prefix: 'far', iconName: 'registered' },
  remove: { prefix: 'fas', iconName: 'xmark' },
  reorder: { prefix: 'fas', iconName: 'bars' },
  repeat: { prefix: 'fas', iconName: 'arrow-rotate-right' },
  rmb: { prefix: 'fas', iconName: 'yen-sign' },
  'rotate-left': { prefix: 'fas', iconName: 'arrow-rotate-left' },
  'rotate-right': { prefix: 'fas', iconName: 'arrow-rotate-right' },
  rouble: { prefix: 'fas', iconName: 'ruble-sign' },
  rub: { prefix: 'fas', iconName: 'ruble-sign' },
  ruble: { prefix: 'fas', iconName: 'ruble-sign' },
  rupee: { prefix: 'fas', iconName: 'indian-rupee-sign' },
  s15: { prefix: 'fas', iconName: 'bath' },
  save: { prefix: 'far', iconName: 'floppy-disk' },
  send: { prefix: 'fas', iconName: 'paper-plane' },
  'send-o': { prefix: 'far', iconName: 'paper-plane' },
  'share-square-o': { prefix: 'fas', iconName: 'share-from-square' },
  shekel: { prefix: 'fas', iconName: 'shekel-sign' },
  sheqel: { prefix: 'fas', iconName: 'shekel-sign' },
  'sign-in': { prefix: 'fas', iconName: 'right-to-bracket' },
  'sign-out': { prefix: 'fas', iconName: 'right-from-bracket' },
  signing: { prefix: 'fas', iconName: 'hands' },
  'smile-o': { prefix: 'far', iconName: 'face-smile' },
  'soccer-ball-o': { prefix: 'far', iconName: 'futbol' },
  'sort-alpha-asc': { prefix: 'fas', iconName: 'arrow-down-a-z' },
  'sort-alpha-desc': { prefix: 'fas', iconName: 'arrow-down-z-a' },
  'sort-amount-asc': { prefix: 'fas', iconName: 'arrow-down-short-wide' },
  'sort-amount-desc': { prefix: 'fas', iconName: 'arrow-down-wide-short' },
  'sort-asc': { prefix: 'fas', iconName: 'sort-up' },
  'sort-desc': { prefix: 'fas', iconName: 'sort-down' },
  'sort-numeric-asc': { prefix: 'fas', iconName: 'arrow-down-1-9' },
  'sort-numeric-desc': { prefix: 'fas', iconName: 'arrow-down-9-1' },
  'star-half-empty': { prefix: 'far', iconName: 'star-half-stroke' },
  'star-half-full': { prefix: 'far', iconName: 'star-half-stroke' },
  'star-half-o': { prefix: 'far', iconName: 'star-half-stroke' },
  'sticky-note-o': { prefix: 'far', iconName: 'note-sticky' },
  'stop-circle-o': { prefix: 'far', iconName: 'circle-stop' },
  support: { prefix: 'fas', iconName: 'life-ring' },
  tablet: { prefix: 'fas', iconName: 'tablet-screen-button' },
  tachometer: { prefix: 'fas', iconName: 'gauge-high' },
  tasks: { prefix: 'fas', iconName: 'bars-progress' },
  television: { prefix: 'fas', iconName: 'tv' },
  thermometer: { prefix: 'fas', iconName: 'temperature-full' },
  'thermometer-0': { prefix: 'fas', iconName: 'temperature-empty' },
  'thermometer-1': { prefix: 'fas', iconName: 'temperature-quarter' },
  'thermometer-2': { prefix: 'fas', iconName: 'temperature-half' },
  'thermometer-3': { prefix: 'fas', iconName: 'temperature-three-quarters' },
  'thermometer-4': { prefix: 'fas', iconName: 'temperature-full' },
  'thumb-tack': { prefix: 'fas', iconName: 'thumbtack' },
  'thumbs-o-down': { prefix: 'far', iconName: 'thumbs-down' },
  'thumbs-o-up': { prefix: 'far', iconName: 'thumbs-up' },
  'times-circle-o': { prefix: 'far', iconName: 'circle-xmark' },
  'times-rectangle': { prefix: 'fas', iconName: 'rectangle-xmark' },
  'times-rectangle-o': { prefix: 'far', iconName: 'rectangle-xmark' },
  'toggle-down': { prefix: 'far', iconName: 'square-caret-down' },
  'toggle-left': { prefix: 'far', iconName: 'square-caret-left' },
  'toggle-right': { prefix: 'far', iconName: 'square-caret-right' },
  'toggle-up': { prefix: 'far', iconName: 'square-caret-up' },
  transgender: { prefix: 'fas', iconName: 'mars-and-venus' },
  'transgender-alt': { prefix: 'fas', iconName: 'transgender' },
  trash: { prefix: 'fas', iconName: 'trash-can' },
  'trash-o': { prefix: 'far', iconName: 'trash-can' },
  try: { prefix: 'fas', iconName: 'turkish-lira-sign' },
  'turkish-lira': { prefix: 'fas', iconName: 'turkish-lira-sign' },
  unlink: { prefix: 'fas', iconName: 'link-slash' },
  'unlock-alt': { prefix: 'fas', iconName: 'unlock' },
  unsorted: { prefix: 'fas', iconName: 'sort' },
  usd: { prefix: 'fas', iconName: 'dollar-sign' },
  'user-circle-o': { prefix: 'far', iconName: 'circle-user' },
  vcard: { prefix: 'fas', iconName: 'address-card' },
  'vcard-o': { prefix: 'far', iconName: 'address-card' },
  'video-camera': { prefix: 'fas', iconName: 'video' },
  'volume-control-phone': { prefix: 'fas', iconName: 'phone-volume' },
  warning: { prefix: 'fas', iconName: 'triangle-exclamation' },
  'window-close-o': { prefix: 'far', iconName: 'rectangle-xmark' },
  'window-maximize': { prefix: 'far', iconName: 'window-maximize' },
  'window-restore': { prefix: 'far', iconName: 'window-restore' },
  won: { prefix: 'fas', iconName: 'won-sign' },
  yen: { prefix: 'fas', iconName: 'yen-sign' },
};

const RE_LONG = /^fa-(solid|regular)\s+fa-(.+)$/;
const RE_SHORT = /^(fa[sr]?)\s+fa-(.+)$/;
const cache = new Map();

/**
 * Resolve an icon class string (any FA version) to an FA7 icon definition object.
 *
 * Accepts FA4, FA5/6 shorthand, or FA7 long-form input:
 *   "fa fa-trash-o"       → icon definition for fa-trash-can (regular)
 *   "fa fa-flask"         → icon definition for fa-flask (solid)
 *   "fas fa-flask"        → icon definition for fa-flask (solid)
 *   "fa-solid fa-flask"   → icon definition for fa-flask (solid)
 *   "icon-cell_line"      → null (not an FA icon)
 *
 * @param {string} iconClassName - CSS class string
 * @returns {object|null} FA7 icon definition for SVG rendering, or null
 */
export function resolveIcon(iconClassName) {
  if (!iconClassName) return null;
  if (cache.has(iconClassName)) return cache.get(iconClassName);

  const result = doResolve(iconClassName);
  cache.set(iconClassName, result);
  return result;
}

function doResolve(iconClassName) {
  let prefix;
  let iconName;

  // FA7 long-form: "fa-solid fa-xxx" or "fa-regular fa-xxx"
  const longMatch = iconClassName.match(RE_LONG);
  if (longMatch) {
    prefix = longMatch[1] === 'regular' ? 'far' : 'fas';
    iconName = longMatch[2];
  } else {
    // FA4/5/6 format: "fa fa-xxx", "fas fa-xxx", "far fa-xxx"
    const shortMatch = iconClassName.match(RE_SHORT);
    if (!shortMatch) return null;
    prefix = shortMatch[1] === 'far' ? 'far' : 'fas';
    iconName = shortMatch[2];
  }

  // Try direct lookup (name unchanged across versions)
  const direct =
    findIconDefinition({ prefix, iconName }) ||
    (prefix !== 'fas' && findIconDefinition({ prefix: 'fas', iconName })) ||
    (prefix !== 'far' && findIconDefinition({ prefix: 'far', iconName }));
  if (direct) return direct;

  // Try shim mapping (FA4 icons that were renamed in FA7)
  const shim = SHIMS[iconName];
  if (shim) return findIconDefinition(shim);

  return null;
}
