import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from './supabaseClient';
import { fetchAllSongAudio } from './services/songAudioService';

import AdminPage from './components/AdminPage';
import AppFooter from './components/AppFooter';
import ConsecrationBeatGroups from './components/ConsecrationBeatGroups';
import LyricsMode from './components/LyricsMode';
import LogTrailPage from './components/LogTrailPage';
import ManualPage from './components/ManualPage';
import OfflineBanner from './components/OfflineBanner';
import ReportsPage from './components/ReportsPage';
import SearchBar from './components/SearchBar';
import SettingsPage from './components/SettingsPage';
import SuggestionsPage from './components/SuggestionsPage';
import SongStatsPage from './components/SongStatsPage';
import SongCard from './components/SongCard';

import useOnlineStatus from './hooks/useOnlineStatus';
import {
  buildAudioCacheEstimate,
  cacheAudioFile,
  getUncachedAudioItems,
  shouldAskBeforeAudioCache
} from './services/offlineAudioCacheService';
import { loadCachedValue, saveCachedValue } from './services/offlineCacheService';
import { songMatchesSearch, updateSongLyrics } from './services/songLyricsService';

import './styles/appFooter.css';
import './styles/lyricsEditor.css';
import './styles/lyricsMode.css';
import './styles/manualPage.css';
import './styles/offlineBanner.css';
import './styles/searchBar.css';
import './styles/songCard.css';
import './styles/audioAttachments.css';
import './styles/appLayout.css';

const SUPER_ADMIN_EMAIL = 'enockoloo6@gmail.com';
const DEFAULT_APP_TITLE = 'Music Manager';
const CACHE_KEYS = {
  APP_TITLE: 'app-title',
  KEYBOARDS: 'keyboards',
  SONGS: 'songs'
};
const DISMISSED_OVERDUE_PRESENTATIONS_KEY = 'music-manager-dismissed-overdue-presentations';
const DISMISSED_OFFLINE_AUDIO_PROMPT_KEY = 'music-manager-dismissed-offline-audio-prompt';
const DISMISSED_INSTALL_PROMPT_KEY = 'music-manager-dismissed-install-prompt';
const CONSECRATION_AUTO_COLLAPSE_KEY = 'music-manager-consecration-auto-collapse-subgroups';
const DEFAULT_INACTIVITY_TIMEOUT_MINUTES = 30;
const CONSECRATION_NO_STYLE_GROUP_NAME = 'Play without styles';

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function loadDismissedOverduePresentations() {
  if (typeof window === 'undefined') return [];

  try {
    const storedValue = window.localStorage.getItem(DISMISSED_OVERDUE_PRESENTATIONS_KEY);
    return storedValue ? JSON.parse(storedValue) : [];
  } catch {
    return [];
  }
}

function loadConsecrationAutoCollapsePreference() {
  if (typeof window === 'undefined') return true;
  const storedValue = window.localStorage.getItem(CONSECRATION_AUTO_COLLAPSE_KEY);
  return storedValue === null ? true : storedValue === '1';
}

function hasDismissedOfflineAudioPrompt() {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(DISMISSED_OFFLINE_AUDIO_PROMPT_KEY) === '1';
}

function hasDismissedInstallPrompt() {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(DISMISSED_INSTALL_PROMPT_KEY) === '1';
}

function isAppInstalled() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isIosDevice() {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent || '');
}

function normalizeOptionValue(value) {
  return String(value || '').trim().toLowerCase();
}

function sortOptionValues(values) {
  return [...new Set(values.filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
}

function addBeatCategoryMapping(map, beatName, categoryName) {
  const beat = beatName?.trim();
  const category = categoryName?.trim();
  if (!beat || !category) return;

  const beatKey = normalizeOptionValue(beat);
  const categoryKey = normalizeOptionValue(category);

  if (!map.beatToCategories[beatKey]) map.beatToCategories[beatKey] = [];
  if (!map.categoryToBeats[categoryKey]) map.categoryToBeats[categoryKey] = [];

  map.beatToCategories[beatKey].push(category);
  map.categoryToBeats[categoryKey].push(beat);
}

function getMappedOptions(mapping, key) {
  return sortOptionValues(mapping?.[normalizeOptionValue(key)] || []);
}

function getAutoCategoryForBeat(beatCategoryMap, beatName) {
  return getMappedOptions(beatCategoryMap?.beatToCategories, beatName)[0] || '';
}

function getBeatOptionsForCategory(beatCategoryMap, categoryName, fallbackOptions) {
  const mappedOptions = getMappedOptions(beatCategoryMap?.categoryToBeats, categoryName);
  return mappedOptions.length > 0 ? mappedOptions : fallbackOptions;
}

const EMPTY_FORM = {
  song_name: '',
  lyrics: '',
  includeBeat: false,
  beat_name: '',
  keyboard_id: '',
  tempo: '',
  key: '',
  location: '',
  beat_use: '',
  is_favorite: false,
  notes: ''
};

const EMPTY_BEAT_FORM = {
  beat_name: '',
  keyboard_id: '',
  tempo: '',
  key: '',
  location: '',
  beat_use: '',
  is_favorite: false,
  notes: ''
};

const EMPTY_CONSECRATION_FORM = {
  group_type: 'style',
  beat_category: '',
  beat_name: '',
  tempo: '',
  musical_key: '',
  variation: '',
  song_names: '',
  song_separator: '',
  is_highlighted: false,
  due_date: '',
  subgroup_size: 6,
  highlighted_subgroup_index: ''
};

const EMPTY_SUGGESTION_FORM = {
  song_name: '',
  suggestion_area: 'consecration',
  suggester_name: '',
  details: ''
};

const MUSICAL_KEY_OPTIONS = [
  'C',
  'C#/Db',
  'D',
  'D#/Eb',
  'E',
  'F',
  'F#/Gb',
  'G',
  'G#/Ab',
  'A',
  'A#/Bb',
  'B'
];

const STEWARD_VERSES = [
  {
    text: 'Be ye stedfast, unmoveable, always abounding in the work of the Lord.',
    reference: '1 Corinthians 15:58'
  },
  {
    text: 'And whatsoever ye do, do it heartily, as to the Lord.',
    reference: 'Colossians 3:23'
  },
  {
    text: 'God is not unrighteous to forget your work and labour of love.',
    reference: 'Hebrews 6:10'
  },
  {
    text: 'Let us not be weary in well doing: for in due season we shall reap.',
    reference: 'Galatians 6:9'
  },
  {
    text: 'Serve the Lord with gladness: come before his presence with singing.',
    reference: 'Psalm 100:2'
  }
];

function getSongLatestTimestamp(song) {
  const styleTimes = (song.styles || [])
    .map(style => style.created_at ? new Date(style.created_at).getTime() : 0)
    .filter(Boolean);

  return Math.max(
    song.created_at ? new Date(song.created_at).getTime() : 0,
    ...styleTimes,
    0
  );
}

function getPresentationTimestamp(song) {
  if (!song.presentation_date) return Number.POSITIVE_INFINITY;

  const timestamp = new Date(`${song.presentation_date}T00:00:00`).getTime();
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

function getPresentationKey(song) {
  return `${song.id}:${song.presentation_date || ''}:${todayDateString()}`;
}

function songWasPresentedOn(song, presentationDate) {
  return (song.song_presentations || []).some(presentation => presentation.presented_on === presentationDate);
}

function RoleBadge({ text, color }) {
  return (
    <span style={{ background: color, color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.62rem', marginLeft: '4px', fontWeight: 600, opacity: 0.85 }}>
      {text}
    </span>
  );
}

function getDisplayName(emailAddress) {
  const localPart = emailAddress?.split('@')[0] || 'Song Steward';
  return localPart
    .replace(/[._-]+/g, ' ')
    .replace(/\d+/g, '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ') || 'Song Steward';
}

function isProtectedOwnerEmail(emailAddress) {
  return String(emailAddress || '').trim().toLowerCase() === SUPER_ADMIN_EMAIL;
}

function formatFriendlyDate(value) {
  if (!value) return 'No date';

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function PresentationPromptModal({
  song,
  mode = 'manual',
  saving = false,
  onConfirm,
  onDismiss
}) {
  if (!song) return null;

  const defaultDate = song.presentation_date || todayDateString();
  const isOverdue = mode === 'overdue';

  return (
    <div className="presentation-modal no-print" role="dialog" aria-modal="true" aria-labelledby="presentation-modal-title">
      <div className="presentation-modal__panel">
        <div>
          <span className="presentation-modal__eyebrow">
            {isOverdue ? 'Presentation reminder' : 'Mark presented'}
          </span>
          <h2 id="presentation-modal-title">{song.song_name}</h2>
          <p>
            {isOverdue
              ? `This highlighted song was due on ${formatFriendlyDate(song.presentation_date)}. Was it presented?`
              : 'Choose the date this song was presented.'}
          </p>
        </div>

        <form
          onSubmit={event => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            onConfirm?.(String(formData.get('presentedOn') || defaultDate));
          }}
        >
          <label>
            Presented date
            <input type="date" name="presentedOn" defaultValue={defaultDate} required />
          </label>

          <div className="presentation-modal__actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Yes, Mark Presented'}
            </button>
            <button type="button" onClick={onDismiss} disabled={saving}>
              {isOverdue ? 'Remind Later' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ActionModal({
  modal,
  saving = false,
  onCancel,
  onConfirm
}) {
  if (!modal) return null;

  const hasInput = Boolean(modal.inputLabel);
  const checkboxOptions = modal.checkboxOptions || [];

  return (
    <div className="app-modal no-print" role="dialog" aria-modal="true" aria-labelledby="app-modal-title">
      <form
        className="app-modal__panel"
        onSubmit={event => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const checkedOptions = Object.fromEntries(
            checkboxOptions.map(option => [option.name, formData.get(option.name) === 'on'])
          );

          onConfirm?.({
            inputValue: hasInput ? String(formData.get('modalInput') || '') : undefined,
            checkedOptions
          });
        }}
      >
        <div>
          <span className="app-modal__eyebrow">{modal.eyebrow || 'Please confirm'}</span>
          <h2 id="app-modal-title">{modal.title}</h2>
          {modal.message && <p>{modal.message}</p>}
        </div>

        {hasInput && (
          <label>
            {modal.inputLabel}
            <input
              name="modalInput"
              defaultValue={modal.inputValue || ''}
              required={modal.inputRequired !== false}
              autoFocus
            />
          </label>
        )}

        {checkboxOptions.length > 0 && (
          <div className="app-modal__checks" aria-label={modal.checkboxLabel || 'Options'}>
            {modal.checkboxLabel && <span>{modal.checkboxLabel}</span>}
            {checkboxOptions.map(option => (
              <label key={option.name}>
                <input
                  type="checkbox"
                  name={option.name}
                  defaultChecked={option.defaultChecked !== false}
                  disabled={option.disabled}
                />
                <span>
                  <strong>{option.label}</strong>
                  {option.description && <small>{option.description}</small>}
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="app-modal__actions">
          <button
            type="submit"
            className={modal.danger ? 'app-modal__danger' : ''}
            disabled={saving}
          >
            {saving ? 'Working...' : modal.confirmText || 'Confirm'}
          </button>
          <button type="button" onClick={onCancel} disabled={saving}>
            {modal.cancelText || 'Cancel'}
          </button>
        </div>
      </form>
    </div>
  );
}

function NoticeModal({ notice, onClose }) {
  if (!notice) return null;

  return (
    <div className="app-modal no-print" role="alertdialog" aria-modal="true" aria-labelledby="notice-modal-title">
      <div className="app-modal__panel">
        <div>
          <span className="app-modal__eyebrow">{notice.eyebrow || 'Notice'}</span>
          <h2 id="notice-modal-title">{notice.title || 'Message'}</h2>
          <p>{notice.message}</p>
        </div>

        <div className="app-modal__actions app-modal__actions--single">
          <button type="button" onClick={onClose} autoFocus>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

function InstallPromptModal({
  mode,
  installing = false,
  onInstall,
  onDismiss
}) {
  if (!mode) return null;

  const isIos = mode === 'ios';

  return (
    <div className="app-modal no-print" role="dialog" aria-modal="true" aria-labelledby="install-prompt-title">
      <div className="app-modal__panel">
        <div>
          <span className="app-modal__eyebrow">Install app</span>
          <h2 id="install-prompt-title">Install Music Manager on this phone?</h2>
          {isIos ? (
            <p>
              To open it like an app, tap Share in Safari, then choose Add to Home Screen.
            </p>
          ) : (
            <p>
              Install this app on your phone so you can open it from your home screen without finding the browser link.
            </p>
          )}
        </div>

        <div className="app-modal__actions">
          {isIos ? (
            <button type="button" onClick={onDismiss}>
              Got It
            </button>
          ) : (
            <button type="button" onClick={onInstall} disabled={installing}>
              {installing ? 'Opening...' : 'Install App'}
            </button>
          )}
          <button type="button" onClick={onDismiss} disabled={installing}>
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}

function AppIntegrated() {
  const [songs, setSongs] = useState([]);
  const [consecrationGroups, setConsecrationGroups] = useState([]);
  const [keyboards, setKeyboards] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  const [appTitle, setAppTitle] = useState(DEFAULT_APP_TITLE);
  const [savingAppTitle, setSavingAppTitle] = useState(false);
  const [offlineCacheNotice, setOfflineCacheNotice] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedContributor, setSelectedContributor] = useState('All');
  const [librarySort, setLibrarySort] = useState('latest');
  const [activeView, setActiveView] = useState('library');
  const [statsSong, setStatsSong] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState({
    approved: false,
    admin: false,
    owner: false,
    protected: false,
    canManageProtectedUsers: false,
    canEditSongs: false,
    canDeleteSongs: false
  });
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [consecrationFormData, setConsecrationFormData] = useState(EMPTY_CONSECRATION_FORM);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionFormData, setSuggestionFormData] = useState(EMPTY_SUGGESTION_FORM);
  const [defaultKeyboardId, setDefaultKeyboardId] = useState('');
  const [logoutTimeoutMinutes, setLogoutTimeoutMinutes] = useState(DEFAULT_INACTIVITY_TIMEOUT_MINUTES);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMoreNav, setShowMoreNav] = useState(false);
  const [actionModal, setActionModal] = useState(null);
  const [noticeModal, setNoticeModal] = useState(null);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [installPromptMode, setInstallPromptMode] = useState(null);
  const [installingApp, setInstallingApp] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editingSongId, setEditingSongId] = useState(null);
  const [editSongName, setEditSongName] = useState('');
  const [lyricsSong, setLyricsSong] = useState(null);
  const [editingLyricsSong, setEditingLyricsSong] = useState(null);
  const [presentationPromptSong, setPresentationPromptSong] = useState(null);
  const [dismissedOverduePresentationKeys, setDismissedOverduePresentationKeys] = useState(loadDismissedOverduePresentations);
  const [offlineAudioPrompt, setOfflineAudioPrompt] = useState(null);
  const [offlineAudioSaving, setOfflineAudioSaving] = useState(false);
  const [offlineAudioNotice, setOfflineAudioNotice] = useState('');
  const [autoCollapseConsecrationSubgroups, setAutoCollapseConsecrationSubgroups] = useState(loadConsecrationAutoCollapsePreference);
  const [stewardVerseState, setStewardVerseState] = useState(() => ({
    index: Math.floor(Math.random() * STEWARD_VERSES.length),
    previous: []
  }));
  const [hideStewardPanel, setHideStewardPanel] = useState(false);

  const isOnline = useOnlineStatus();
  const inactivityTimerRef = useRef(null);
  const moreNavRef = useRef(null);

  function showAppNotice(message, title = 'Message') {
    setNoticeModal({
      title,
      message: String(message || '')
    });
  }

  function updateConsecrationAutoCollapseSubgroups(enabled) {
    const nextValue = Boolean(enabled);
    setAutoCollapseConsecrationSubgroups(nextValue);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CONSECRATION_AUTO_COLLAPSE_KEY, nextValue ? '1' : '0');
    }
  }

  useEffect(() => {
    fetchSongs(false);
    fetchKeyboards();
    loadAppSettings();
    // Initial bootstrapping runs once; auth-specific refreshes happen in the auth listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.title = appTitle || DEFAULT_APP_TITLE;
  }, [appTitle]);

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = message => {
      showAppNotice(message);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  useEffect(() => {
    if (isAppInstalled() || hasDismissedInstallPrompt()) return undefined;

    function showInstallPrompt(mode, event = null) {
      if (isAppInstalled() || hasDismissedInstallPrompt()) return;
      setInstallPromptEvent(event);
      setInstallPromptMode(mode);
    }

    const handleBeforeInstallPrompt = event => {
      event.preventDefault();
      showInstallPrompt('native', event);
    };

    const handleAppInstalled = () => {
      setInstallPromptEvent(null);
      setInstallPromptMode(null);
      window.sessionStorage.setItem(DISMISSED_INSTALL_PROMPT_KEY, '1');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const iosPromptTimer = window.setTimeout(() => {
      if (isIosDevice()) {
        showInstallPrompt('ios');
      }
    }, 1200);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.clearTimeout(iosPromptTimer);
    };
  }, []);

  useEffect(() => {
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    if (!user || !logoutTimeoutMinutes) return undefined;

    const timeoutMs = Number(logoutTimeoutMinutes) * 60 * 1000;
    const resetInactivityTimer = () => {
      if (document.hidden) return;
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = window.setTimeout(() => {
        supabase.auth.signOut();
      }, timeoutMs);
    };

    const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(eventName => {
      window.addEventListener(eventName, resetInactivityTimer, { passive: true });
    });
    document.addEventListener('visibilitychange', resetInactivityTimer);
    resetInactivityTimer();

    return () => {
      window.clearTimeout(inactivityTimerRef.current);
      activityEvents.forEach(eventName => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });
      document.removeEventListener('visibilitychange', resetInactivityTimer);
    };
  }, [user, logoutTimeoutMinutes]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchSongs(true);
        loadRole(session.user.id, session.user.email).finally(() => setAuthLoading(false));
      } else {
        setAuthLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchSongs(true);
        loadRole(session.user.id, session.user.email).finally(() => setAuthLoading(false));
        setShowLoginForm(false);
      } else {
        setUser(null);
        setRole({ approved: false, admin: false, owner: false, protected: false, canManageProtectedUsers: false, canEditSongs: false, canDeleteSongs: false });
        setAuditLogs([]);
        setConsecrationGroups([]);
        setSuggestions([]);
        setSuggestionFormData(EMPTY_SUGGESTION_FORM);
        setLogoutTimeoutMinutes(DEFAULT_INACTIVITY_TIMEOUT_MINUTES);
        setShowAddForm(false);
        setShowMoreNav(false);
        setSelectedCategory('All');
        setSelectedContributor('All');
        fetchSongs(false);
        setActiveView('library');
        setAuthLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
    // Register the auth listener once for the lifetime of this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeView === 'consecration' && user && (role.approved || role.admin)) {
      fetchConsecrationGroups();
    }
  }, [activeView, user, role.approved, role.admin]);

  useEffect(() => {
    if (activeView === 'suggestions' && user) {
      fetchSuggestions();
    }
    // Fetch when the Suggestions view opens or review permissions change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, user, role.approved, role.admin]);

  useEffect(() => {
    if (!showMoreNav) return undefined;

    function closeMoreNavOnOutsidePointer(event) {
      if (!moreNavRef.current?.contains(event.target)) {
        setShowMoreNav(false);
      }
    }

    document.addEventListener('pointerdown', closeMoreNavOnOutsidePointer);

    return () => {
      document.removeEventListener('pointerdown', closeMoreNavOnOutsidePointer);
    };
  }, [showMoreNav]);

  async function loadRole(userId, userEmail) {
    const protectedOwner = isProtectedOwnerEmail(userEmail);

    try {
      let profileResult = await supabase
        .from('profiles')
        .select('is_approved, is_admin, is_super_admin, is_protected, can_manage_protected_users, default_keyboard_id, logout_timeout_minutes, can_edit_songs, can_delete_songs')
        .eq('id', userId)
        .maybeSingle();

      if (profileResult.error) {
        console.warn('loadRole permissions fallback:', profileResult.error.message);
        profileResult = await supabase
          .from('profiles')
          .select('is_approved, is_admin, is_super_admin, default_keyboard_id')
          .eq('id', userId)
          .maybeSingle();
      }

      if (profileResult.error) throw profileResult.error;

      const profile = profileResult.data;

      if (profile) {
        const nextRole = {
          approved: protectedOwner || Boolean(profile.is_protected) || Boolean(profile.is_approved),
          admin: protectedOwner || Boolean(profile.is_protected) || Boolean(profile.is_admin),
          owner: protectedOwner || Boolean(profile.is_protected) || Boolean(profile.is_super_admin),
          protected: protectedOwner || Boolean(profile.is_protected),
          canManageProtectedUsers: protectedOwner || Boolean(profile.can_manage_protected_users),
          canEditSongs: protectedOwner || Boolean(profile.is_protected) || Boolean(profile.is_super_admin) || Boolean(profile.can_edit_songs ?? profile.is_approved),
          canDeleteSongs: protectedOwner || Boolean(profile.is_protected) || Boolean(profile.is_super_admin) || Boolean(profile.can_delete_songs)
        };

        setRole(nextRole);
        if (nextRole.owner) loadProfiles({ force: true });

        if (profile.default_keyboard_id) {
          const keyboardId = String(profile.default_keyboard_id);
          setDefaultKeyboardId(keyboardId);
          setFormData(current => ({ ...current, keyboard_id: keyboardId }));
        }

        setLogoutTimeoutMinutes(Number(profile.logout_timeout_minutes) || DEFAULT_INACTIVITY_TIMEOUT_MINUTES);
      } else {
        await supabase.from('profiles').insert({
          id: userId,
          email: userEmail,
          is_approved: protectedOwner,
          is_admin: protectedOwner,
          is_super_admin: protectedOwner,
          is_protected: protectedOwner,
          can_manage_protected_users: protectedOwner,
          can_edit_songs: protectedOwner,
          can_delete_songs: protectedOwner,
          logout_timeout_minutes: DEFAULT_INACTIVITY_TIMEOUT_MINUTES
        });
        setRole({
          approved: protectedOwner,
          admin: protectedOwner,
          owner: protectedOwner,
          protected: protectedOwner,
          canManageProtectedUsers: protectedOwner,
          canEditSongs: protectedOwner,
          canDeleteSongs: protectedOwner
        });
        setLogoutTimeoutMinutes(DEFAULT_INACTIVITY_TIMEOUT_MINUTES);
      }
    } catch (err) {
      console.error('loadRole error:', err.message);
      setRole({
        approved: protectedOwner,
        admin: protectedOwner,
        owner: protectedOwner,
        protected: protectedOwner,
        canManageProtectedUsers: protectedOwner,
        canEditSongs: protectedOwner,
        canDeleteSongs: protectedOwner
      });
    }
  }

  async function loadProfiles({ force = false } = {}) {
    if (!force && !role.owner) return;

    const { data, error } = await supabase.rpc('get_all_profiles');
    if (error) {
      showAppNotice('Users failed to load: ' + error.message);
      return;
    }

    setProfiles(data || []);
  }

  async function loadAuditLogs() {
    if (!role.owner) return;

    setAuditLogsLoading(true);

    try {
      const { data, error } = await supabase.rpc('get_audit_logs');
      if (error) throw error;
      setAuditLogs(data || []);
    } catch (err) {
      showAppNotice('Log trail failed to load: ' + err.message);
    } finally {
      setAuditLogsLoading(false);
    }
  }

  async function clearAuditLogs() {
    if (!role.owner) {
      showAppNotice('Only a super admin can clear the log trail.');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.rpc('clear_audit_logs');
      if (error) throw error;
      setAuditLogs([]);
      showAppNotice('Log trail cleared.');
    } catch (err) {
      showAppNotice('Log trail clear failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function requestClearAuditLogs() {
    if (!role.owner) {
      showAppNotice('Only a super admin can clear the log trail.');
      return;
    }

    setActionModal({
      type: 'clearAuditLogs',
      eyebrow: 'Clear log trail',
      title: 'Clear the Log Trail?',
      message: 'This removes existing log entries. A fresh record will be kept showing that the log trail was cleared.',
      confirmText: 'Clear Log Trail',
      danger: true
    });
  }

  async function loadAppSettings() {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'app_title')
      .maybeSingle();

    if (error) {
      console.error('loadAppSettings error:', error.message);
      const cachedTitle = loadCachedValue(CACHE_KEYS.APP_TITLE);
      if (cachedTitle?.value) {
        setAppTitle(cachedTitle.value);
        setOfflineCacheNotice('Showing locally cached library data.');
      }
      return;
    }

    if (data?.setting_value) {
      setAppTitle(data.setting_value);
      saveCachedValue(CACHE_KEYS.APP_TITLE, data.setting_value);
    }
  }

  async function updateAppTitle(nextTitle) {
    if (!role.owner) return;

    const title = nextTitle.trim();
    if (!title) {
      showAppNotice('Please enter an app name.');
      return;
    }

    setSavingAppTitle(true);

    try {
      const { error } = await supabase.rpc('admin_set_app_setting', {
        setting_key: 'app_title',
        setting_value: title
      });

      if (error) throw error;
      setAppTitle(title);
      saveCachedValue(CACHE_KEYS.APP_TITLE, title);
    } catch (err) {
      showAppNotice('App name update failed: ' + err.message);
    } finally {
      setSavingAppTitle(false);
    }
  }

  async function updateProfileAccess(profileId, updates) {
    if (!role.owner) {
      showAppNotice('Only a super admin can manage users.');
      return;
    }

    const target = profiles.find(profile => profile.id === profileId);
    if (!target) return;

    const normalizedUpdates = updates.is_super_admin
      ? { ...updates, can_edit_songs: true, can_delete_songs: true }
      : updates.is_protected
        ? {
            ...updates,
            is_approved: true,
            is_admin: true,
            is_super_admin: true,
            can_edit_songs: true,
            can_delete_songs: true
          }
      : updates;
    const nextProfile = { ...target, ...normalizedUpdates };

    const { error } = await supabase.rpc('admin_update_profile', {
      target_id: profileId,
      new_is_approved: Boolean(nextProfile.is_approved),
      new_is_admin: Boolean(nextProfile.is_admin),
      new_is_super_admin: Object.prototype.hasOwnProperty.call(normalizedUpdates, 'is_super_admin') ? Boolean(normalizedUpdates.is_super_admin) : null,
      new_is_protected: Object.prototype.hasOwnProperty.call(normalizedUpdates, 'is_protected') ? Boolean(normalizedUpdates.is_protected) : null,
      new_can_edit_songs: Object.prototype.hasOwnProperty.call(normalizedUpdates, 'can_edit_songs') ? Boolean(normalizedUpdates.can_edit_songs) : null,
      new_can_delete_songs: Object.prototype.hasOwnProperty.call(normalizedUpdates, 'can_delete_songs') ? Boolean(normalizedUpdates.can_delete_songs) : null,
      new_can_manage_protected_users: Object.prototype.hasOwnProperty.call(normalizedUpdates, 'can_manage_protected_users') ? Boolean(normalizedUpdates.can_manage_protected_users) : null
    });

    if (error) {
      showAppNotice('Update failed: ' + error.message);
      return;
    }

    loadProfiles();
  }

  function toggleStatus(profileId, field, current) {
    updateProfileAccess(profileId, { [field]: !current });
  }

  function toggleActionPermission(profileId, field, current) {
    updateProfileAccess(profileId, { [field]: !current });
  }

  async function recordAuditLog(actionType, targetTable, targetId, targetLabel) {
    const { error } = await supabase.rpc('log_user_action', {
      action_type: actionType,
      target_table: targetTable,
      target_id: String(targetId),
      target_label: targetLabel
    });

    if (error) {
      console.error('audit log failed:', error.message);
    }
  }

  async function updateSongPlanning(songId, updates) {
    if (!role.admin) return;

    setSaving(true);

    try {
      const payload = {
        presentation_owner_id: user?.id || null,
        presentation_marked_at: new Date().toISOString()
      };

      if (Object.prototype.hasOwnProperty.call(updates, 'is_highlighted')) {
        payload.is_highlighted = Boolean(updates.is_highlighted);
      }

      if (Object.prototype.hasOwnProperty.call(updates, 'is_hidden')) {
        payload.is_hidden = Boolean(updates.is_hidden);
      }

      if (Object.prototype.hasOwnProperty.call(updates, 'presentation_date')) {
        payload.presentation_date = updates.presentation_date || null;
      }

      const { error } = await supabase
        .from('songs')
        .update(payload)
        .eq('id', songId);

      if (error) throw error;
      await fetchSongs(true);
    } catch (err) {
      showAppNotice('Song planning update failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function requestSongVisibilityChange(song, nextHidden) {
    setActionModal({
      type: 'songVisibility',
      song,
      nextHidden,
      eyebrow: nextHidden ? 'Hide song' : 'Show song',
      title: nextHidden ? `Hide ${song.song_name}?` : `Show ${song.song_name}?`,
      message: nextHidden
        ? 'Hidden songs stay saved, but non-admin users will not see them in the library.'
        : 'This song will return to the normal library view for users.',
      confirmText: nextHidden ? 'Hide Song' : 'Show Song'
    });
  }

  async function markSongPresented(song, presentedDate, options = {}) {
    if (!(role.approved || role.admin) || !user) return;

    const { showSuccess = true } = options;
    const presentedOn = presentedDate?.trim();

    if (!presentedOn) return false;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('song_presentations')
        .insert({
          song_id: song.id,
          presented_on: presentedOn,
          presented_by: user.id
        });

      if (error) throw error;
      await fetchSongs(true);
      if (showSuccess) {
        showAppNotice('Song marked as presented.');
      }
      return true;
    } catch (err) {
      if (err.message?.includes('duplicate key')) {
        showAppNotice('This song is already marked as presented for that date.');
      } else {
        showAppNotice('Mark presented failed: ' + err.message);
      }
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveLibraryAudioOffline(items, { showNotice = true } = {}) {
    if (!items?.length) return;

    setOfflineAudioSaving(true);
    setOfflineAudioNotice('');

    try {
      for (const item of items) {
        await cacheAudioFile(item);
      }

      if (showNotice) {
        setOfflineAudioNotice('Audio saved for offline playback.');
      }
      setOfflineAudioPrompt(null);
    } catch (err) {
      console.error('offline library audio cache failed:', err);
      setOfflineAudioNotice('Some audio could not be saved for offline playback.');
    } finally {
      setOfflineAudioSaving(false);
    }
  }

  async function prepareLibraryAudioOffline() {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

    try {
      const allAudio = await fetchAllSongAudio();
      const uncachedAudio = await getUncachedAudioItems(allAudio);
      if (uncachedAudio.length === 0) return;

      const estimate = buildAudioCacheEstimate(uncachedAudio);
      if (shouldAskBeforeAudioCache()) {
        if (!hasDismissedOfflineAudioPrompt()) {
          setOfflineAudioPrompt(estimate);
        }
        return;
      }

      await saveLibraryAudioOffline(uncachedAudio, { showNotice: false });
    } catch (err) {
      console.error('offline audio preparation failed:', err);
    }
  }

  async function fetchSongs(includeContributors = Boolean(user)) {
    const { data, error } = await supabase
      .from('songs')
      .select('*, styles (*, keyboards (model_name)), song_audio (id)')
      .order('song_name');

    if (error) {
      console.error('fetchSongs error:', error.message);
      const cachedSongs = loadCachedValue(CACHE_KEYS.SONGS);
      if (cachedSongs?.value) {
        setSongs(cachedSongs.value);
        setOfflineCacheNotice('Showing locally cached library data.');
      }
      return;
    }

    let nextSongs = data || [];
    let presentationRows = [];

    if (includeContributors && nextSongs.length > 0) {
      const songIds = nextSongs.map(song => song.id);
      const { data: presentationsData, error: presentationsError } = await supabase
        .from('song_presentations')
        .select('*')
        .in('song_id', songIds)
        .order('presented_on', { ascending: false });

      if (!presentationsError) {
        presentationRows = presentationsData || [];
      }

      const profileIds = [
        ...new Set(
          [
            ...nextSongs.flatMap(song => [song.created_by, song.presentation_owner_id]),
            ...presentationRows.map(presentation => presentation.presented_by)
          ]
            .filter(Boolean)
        )
      ];

      let profileById = new Map();

      if (profileIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', profileIds);

        if (!profileError) {
          profileById = new Map((profileRows || []).map(profile => [profile.id, profile]));
        }
      }

      const presentationsBySongId = new Map();
      presentationRows.forEach(presentation => {
        const enrichedPresentation = {
          ...presentation,
          presenter: profileById.get(presentation.presented_by) || null
        };
        const songPresentations = presentationsBySongId.get(presentation.song_id) || [];
        songPresentations.push(enrichedPresentation);
        presentationsBySongId.set(presentation.song_id, songPresentations);
      });

      nextSongs = nextSongs.map(song => ({
        ...song,
        contributor: profileById.get(song.created_by) || null,
        presentation_owner: profileById.get(song.presentation_owner_id) || null,
        song_presentations: presentationsBySongId.get(song.id) || []
      }));
    }

    setSongs(nextSongs);
    saveCachedValue(CACHE_KEYS.SONGS, nextSongs);
    setOfflineCacheNotice('');
    void prepareLibraryAudioOffline();
  }

  async function fetchConsecrationGroups() {
    const { data, error } = await supabase
      .from('consecration_beat_groups')
      .select('*, consecration_beat_group_songs (id, song_id, sort_order, songs (id, song_name))')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('fetchConsecrationGroups error:', error.message);
      return;
    }

    const nextGroups = (data || [])
      .map(group => ({
        ...group,
        songs: (group.consecration_beat_group_songs || [])
          .slice()
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .map(item => item.songs)
          .filter(Boolean)
      }))
      .sort((a, b) => {
        if (Boolean(a.is_highlighted) !== Boolean(b.is_highlighted)) {
          return a.is_highlighted ? -1 : 1;
        }
        if (a.is_highlighted && b.is_highlighted) {
          const aDue = a.due_date ? new Date(`${a.due_date}T00:00:00`).getTime() : Number.POSITIVE_INFINITY;
          const bDue = b.due_date ? new Date(`${b.due_date}T00:00:00`).getTime() : Number.POSITIVE_INFINITY;
          if (aDue !== bDue) return aDue - bDue;
        }
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });

    setConsecrationGroups(nextGroups);
  }

  async function fetchSuggestions() {
    const { data, error } = await supabase
      .from('song_suggestions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      showAppNotice('Suggestions failed to load: ' + error.message);
      return;
    }

    setSuggestions(data || []);
  }

  async function saveSuggestion(event) {
    event.preventDefault();

    const songName = suggestionFormData.song_name.trim();

    if (!songName) {
      showAppNotice('Please enter the suggested song name.');
      return;
    }

    const existingSong = songs.find(song => song.song_name.toLowerCase() === songName.toLowerCase());
    if (existingSong) {
      showAppNotice(`"${existingSong.song_name}" is already in the library. Please use the existing song instead of suggesting it.`);
      return;
    }

    if (user) {
      const existingOpenSuggestion = suggestions.find(suggestion => (
        suggestion.song_name.toLowerCase() === songName.toLowerCase()
      ));
      if (existingOpenSuggestion) {
        showAppNotice(`"${existingOpenSuggestion.song_name}" is already in Suggestions and is waiting for review.`);
        return;
      }
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('song_suggestions')
        .insert({
          song_name: songName,
          suggestion_area: suggestionFormData.suggestion_area || 'consecration',
          suggester_name: suggestionFormData.suggester_name?.trim() || null,
          details: suggestionFormData.details?.trim() || null,
          created_by: user?.id || null,
          suggester_email: user?.email || null
        });

      if (error) throw error;
      setSuggestionFormData(EMPTY_SUGGESTION_FORM);
      if (user) {
        await fetchSuggestions();
      }
      showAppNotice('Suggestion submitted.');
    } catch (err) {
      showAppNotice('Suggestion save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function viewSuggestionDetails(suggestion) {
    const details = [
      `Song: ${suggestion.song_name}`,
      `For: ${suggestion.suggestion_area || 'Not specified'}`,
      suggestion.suggester_name ? `Suggested by: ${suggestion.suggester_name}` : '',
      suggestion.details ? `Details: ${suggestion.details}` : ''
    ].filter(Boolean).join('\n\n');

    showAppNotice(details, 'Suggestion Details');
  }

  async function deleteSuggestion(suggestion) {
    if (!role.canDeleteSongs) {
      showAppNotice('You do not have permission to delete suggestions.');
      return;
    }

    setActionModal({
      type: 'deleteSuggestion',
      suggestion,
      eyebrow: 'Delete suggestion',
      title: `Delete ${suggestion.song_name}?`,
      message: 'This removes the suggestion from the review list. This cannot be undone.',
      confirmText: 'Delete Suggestion',
      danger: true
    });
  }

  function parseConsecrationSongNames(value) {
    const seenNames = new Set();

    return String(value || '')
      .split(/\r?\n/)
      .map(line => line.replace(/^♪+/, '').trim())
      .filter(Boolean)
      .filter(songName => {
        const normalizedName = songName.toLowerCase();
        if (seenNames.has(normalizedName)) return false;
        seenNames.add(normalizedName);
        return true;
      });
  }

  async function findOrCreateSongByName(songName) {
    const existingSong = songs.find(song => song.song_name.toLowerCase() === songName.toLowerCase());
    if (existingSong) return existingSong;

    const { data, error } = await supabase
      .from('songs')
      .upsert({ song_name: songName, created_by: user?.id || null }, { onConflict: 'song_name' })
      .select('id, song_name')
      .single();

    if (error) throw error;
    return data;
  }

  function getConsecrationGroupPayload(groupFormData, songCount = 0) {
    const isNoStyleGroup = groupFormData.group_type === 'no_style';
    const subgroupSize = Math.max(1, Number(groupFormData.subgroup_size) || 6);
    const subgroupCount = Math.ceil(songCount / subgroupSize);
    const highlightedSubgroupIndex = Number(groupFormData.highlighted_subgroup_index) || null;
    return {
      title: 'Consecration Songs',
      beat_name: isNoStyleGroup ? CONSECRATION_NO_STYLE_GROUP_NAME : groupFormData.beat_name.trim(),
      beat_category: isNoStyleGroup ? null : groupFormData.beat_category.trim() || null,
      tempo: isNoStyleGroup ? null : groupFormData.tempo || null,
      musical_key: isNoStyleGroup ? null : groupFormData.musical_key?.trim() || null,
      variation: isNoStyleGroup ? null : groupFormData.variation.trim() || null,
      is_highlighted: Boolean(groupFormData.is_highlighted),
      due_date: groupFormData.due_date || null,
      subgroup_size: subgroupSize,
      highlighted_subgroup_index: highlightedSubgroupIndex && highlightedSubgroupIndex <= subgroupCount
        ? highlightedSubgroupIndex
        : null
    };
  }

  async function saveConsecrationBeatGroup() {
    if (!user || !(role.approved || role.admin)) {
      showAppNotice('Please log in with an approved account to add Consecration groups.');
      return false;
    }

    const songNames = parseConsecrationSongNames(consecrationFormData.song_names);
    const groupPayload = getConsecrationGroupPayload(consecrationFormData, songNames.length);
    const beatName = groupPayload.beat_name;

    if (!beatName) {
      showAppNotice('Please enter the keyboard style or choose Play without styles.');
      return false;
    }

    if (songNames.length === 0) {
      showAppNotice('Please enter at least one song under this group.');
      return false;
    }

    setSaving(true);

    try {
      const { data: group, error: groupError } = await supabase
        .from('consecration_beat_groups')
        .insert({
          ...groupPayload,
          created_by: user.id
        })
        .select('id')
        .single();

      if (groupError) throw groupError;

      const linkedSongs = [];
      for (const songName of songNames) {
        linkedSongs.push(await findOrCreateSongByName(songName));
      }

      const { error: songsError } = await supabase
        .from('consecration_beat_group_songs')
        .insert(linkedSongs.map((song, index) => ({
          group_id: group.id,
          song_id: song.id,
          sort_order: index + 1
        })));

      if (songsError) throw songsError;

      await recordAuditLog('beat_edit', 'consecration_beat_groups', group.id, beatName);
      setConsecrationFormData(EMPTY_CONSECRATION_FORM);
      await Promise.all([fetchSongs(true), fetchConsecrationGroups()]);
      showAppNotice('Consecration group saved.');
      return true;
    } catch (err) {
      showAppNotice('Consecration group save failed: ' + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function updateConsecrationBeatGroup(groupId, groupFormData) {
    if (!user || !(role.approved || role.admin)) {
      showAppNotice('Please log in with an approved account to edit Consecration groups.');
      return false;
    }

    const songNames = parseConsecrationSongNames(groupFormData.song_names);
    const groupPayload = getConsecrationGroupPayload(groupFormData, songNames.length);
    const beatName = groupPayload.beat_name;

    if (!beatName) {
      showAppNotice('Please enter the keyboard style or choose Play without styles.');
      return false;
    }

    if (songNames.length === 0) {
      showAppNotice('Please enter at least one song under this group.');
      return false;
    }

    setSaving(true);

    try {
      const { error: groupError } = await supabase
        .from('consecration_beat_groups')
        .update(groupPayload)
        .eq('id', groupId);

      if (groupError) throw groupError;

      const linkedSongs = [];
      for (const songName of songNames) {
        linkedSongs.push(await findOrCreateSongByName(songName));
      }

      const { error: songsError } = await supabase
        .from('consecration_beat_group_songs')
        .upsert(linkedSongs.map((song, index) => ({
          group_id: groupId,
          song_id: song.id,
          sort_order: index + 1
        })), { onConflict: 'group_id,song_id' });

      if (songsError) throw songsError;

      const linkedSongIds = linkedSongs.map(song => song.id);
      const { error: deleteLinksError } = await supabase
        .from('consecration_beat_group_songs')
        .delete()
        .eq('group_id', groupId)
        .not('song_id', 'in', `(${linkedSongIds.join(',')})`);

      if (deleteLinksError) throw deleteLinksError;

      await recordAuditLog('beat_edit', 'consecration_beat_groups', groupId, beatName);
      await Promise.all([fetchSongs(true), fetchConsecrationGroups()]);
      showAppNotice('Consecration group updated.');
      return true;
    } catch (err) {
      showAppNotice('Consecration group update failed: ' + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function fetchKeyboards() {
    const { data, error } = await supabase
      .from('keyboards')
      .select('*')
      .order('model_name');

    if (error) {
      console.error('fetchKeyboards error:', error.message);
      const cachedKeyboards = loadCachedValue(CACHE_KEYS.KEYBOARDS);
      if (cachedKeyboards?.value) {
        setKeyboards(cachedKeyboards.value);
        setOfflineCacheNotice('Showing locally cached library data.');
      }
      return;
    }

    setKeyboards(data || []);
    saveCachedValue(CACHE_KEYS.KEYBOARDS, data || []);
  }

  async function handleAuth(e) {
    e.preventDefault();

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      showAppNotice('Please enter your email and password.');
      return;
    }

    setAuthLoading(true);

    if (authMode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password });
      if (error) {
        showAppNotice(error.message);
        setAuthLoading(false);
        return;
      }

      if (data.session?.user) {
        setUser(data.session.user);
        await loadRole(data.session.user.id, data.session.user.email);
      }

      showAppNotice('Account request sent! Wait for admin approval.');
      setShowLoginForm(false);
      setPassword('');
      setAuthLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error) {
      showAppNotice(error.message);
      setAuthLoading(false);
    }
  }

  function handleSignOut() {
    window.clearTimeout(inactivityTimerRef.current);
    supabase.auth.signOut();
  }

  async function installApp() {
    if (!installPromptEvent) {
      setInstallPromptMode(null);
      return;
    }

    setInstallingApp(true);

    try {
      installPromptEvent.prompt();
      await installPromptEvent.userChoice;
      window.sessionStorage.setItem(DISMISSED_INSTALL_PROMPT_KEY, '1');
      setInstallPromptEvent(null);
      setInstallPromptMode(null);
    } catch (err) {
      showAppNotice('Install prompt could not be opened: ' + err.message);
    } finally {
      setInstallingApp(false);
    }
  }

  function dismissInstallPrompt() {
    window.sessionStorage.setItem(DISMISSED_INSTALL_PROMPT_KEY, '1');
    setInstallPromptEvent(null);
    setInstallPromptMode(null);
  }

  async function claimAdminBootstrap() {
    if (!user) return;

    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true)
      .limit(1);

    if (admins?.length > 0) {
      showAppNotice('An admin already exists. Ask them to approve you.');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true, is_admin: true })
      .eq('id', user.id);

    if (error) {
      showAppNotice('Error: ' + error.message);
      return;
    }

    setRole({
      approved: true,
      admin: true,
      owner: isProtectedOwnerEmail(user.email),
      protected: isProtectedOwnerEmail(user.email),
      canEditSongs: true,
      canDeleteSongs: isProtectedOwnerEmail(user.email),
      canManageProtectedUsers: isProtectedOwnerEmail(user.email)
    });
    loadProfiles();
    showAppNotice('✅ You are now admin!');
  }

  async function deleteEntry(table, id) {
    if (!role.canDeleteSongs) {
      showAppNotice('You do not have permission to delete songs or beat settings.');
      return false;
    }

    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      showAppNotice('Delete failed: ' + error.message);
      return false;
    }

    fetchSongs();
    return true;
  }

  function requestDeleteSong(song) {
    setActionModal({
      type: 'deleteEntry',
      table: 'songs',
      id: song.id,
      targetLabel: song.song_name,
      eyebrow: 'Delete song',
      title: `Delete ${song.song_name}?`,
      message: 'This removes the song and its attached beat details. This cannot be undone.',
      confirmText: 'Delete Song',
      danger: true
    });
  }

  function requestDeleteBeat(style) {
    setActionModal({
      type: 'deleteEntry',
      table: 'styles',
      id: style.id,
      targetLabel: style.beat_name,
      eyebrow: 'Remove beat',
      title: `Remove ${style.beat_name}?`,
      message: 'This removes only this beat from the song.',
      confirmText: 'Remove Beat',
      danger: true
    });
  }

  function updateFormBeatName(beatName) {
    const autoCategory = getAutoCategoryForBeat(beatCategoryMap, beatName);
    setFormData({
      ...formData,
      beat_name: beatName,
      location: autoCategory || formData.location
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const songName = formData.song_name.trim();
    const lyrics = formData.lyrics.trim();
    const beatName = formData.beat_name.trim();
    const beatSupportingDetailsProvided = formData.includeBeat && Boolean(
      formData.tempo
      || formData.key.trim()
      || formData.location.trim()
      || formData.beat_use.trim()
      || formData.is_favorite
      || formData.notes.trim()
    );
    const beatDetailsProvided = formData.includeBeat && Boolean(beatName);

    if (!songName) {
      showAppNotice('Please enter a song name.');
      return;
    }

    if (!beatName && beatSupportingDetailsProvided) {
      showAppNotice('Please enter a beat name before saving piano settings, or clear those optional piano details.');
      return;
    }

    setSaving(true);

    try {
      const songPayload = {
        song_name: songName
      };

      if (lyrics) {
        songPayload.lyrics = lyrics;
      }

      const { data: songData, error: songErr } = await supabase
        .from('songs')
        .upsert(songPayload, { onConflict: 'song_name' })
        .select()
        .single();

      if (songErr) throw songErr;

      if (!songData.created_by && user?.id) {
        const { error: contributorErr } = await supabase
          .from('songs')
          .update({ created_by: user.id })
          .eq('id', songData.id)
          .is('created_by', null);

        if (contributorErr) throw contributorErr;
      }

      if (beatDetailsProvided) {
        const { error: styleErr } = await supabase.from('styles').insert([{
          song_id: songData.id,
          keyboard_id: formData.keyboard_id || null,
          beat_name: beatName,
          keyboard_location: formData.location.trim() || null,
          style_category: formData.beat_use.trim() || null,
          is_favorite: Boolean(formData.is_favorite),
          tempo: formData.tempo || null,
          musical_key: formData.key.trim() || null,
          notes: formData.notes.trim() || null
        }]);

        if (styleErr) throw styleErr;
      }

      setFormData({ ...EMPTY_FORM, keyboard_id: defaultKeyboardId });
      await fetchSongs();
      showAppNotice(beatDetailsProvided ? '✅ Song and beat saved!' : '✅ Song saved!');
    } catch (err) {
      showAppNotice('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(style) {
    setEditingId(style.id);
    setEditData({
      beat_name: style.beat_name || '',
      keyboard_id: style.keyboard_id || '',
      location: style.keyboard_location || '',
      beat_use: style.style_category || '',
      is_favorite: Boolean(style.is_favorite),
      tempo: style.tempo || '',
      key: style.musical_key || '',
      notes: style.notes || ''
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({});
  }

  function startSongEdit(song) {
    setEditingSongId(song.id);
    setEditSongName(song.song_name || '');
  }

  function cancelSongEdit() {
    setEditingSongId(null);
    setEditSongName('');
  }

  async function saveSongEdit(songId) {
    if (!role.canEditSongs) {
      showAppNotice('You do not have permission to edit songs.');
      return;
    }

    const nextName = editSongName.trim();

    if (!nextName) {
      showAppNotice('Please enter a song name.');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('songs')
        .update({ song_name: nextName })
        .eq('id', songId);

      if (error) throw error;
      await recordAuditLog('song_edit', 'songs', songId, nextName);
      cancelSongEdit();
      await fetchSongs();
    } catch (err) {
      showAppNotice('Song update failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(styleId) {
    if (!role.canEditSongs) {
      showAppNotice('You do not have permission to edit beat settings.');
      return;
    }

    if (!editData.keyboard_id) {
      showAppNotice('Please select a keyboard.');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.from('styles').update({
        beat_name: editData.beat_name,
        keyboard_id: editData.keyboard_id,
        keyboard_location: editData.location,
        style_category: editData.beat_use || null,
        is_favorite: Boolean(editData.is_favorite),
        tempo: editData.tempo || null,
        musical_key: editData.key,
        notes: editData.notes
      }).eq('id', styleId);

      if (error) throw error;
      await recordAuditLog('beat_edit', 'styles', styleId, editData.beat_name || 'Beat setting');
      cancelEdit();
      await fetchSongs();
    } catch (err) {
      showAppNotice('Update failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function addBeatToSong(song, beatData) {
    if (!role.canEditSongs) {
      showAppNotice('You do not have permission to add beat settings.');
      return false;
    }

    const beatName = beatData.beat_name?.trim();

    if (!beatName) {
      showAppNotice('Please enter a beat name.');
      return false;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase.from('styles').insert([{
        song_id: song.id,
        keyboard_id: beatData.keyboard_id || null,
        beat_name: beatName,
        keyboard_location: beatData.location?.trim() || null,
        style_category: beatData.beat_use?.trim() || null,
        is_favorite: Boolean(beatData.is_favorite),
        tempo: beatData.tempo || null,
        musical_key: beatData.key?.trim() || null,
        notes: beatData.notes?.trim() || null
      }])
        .select('id')
        .single();

      if (error) throw error;
      await recordAuditLog('beat_edit', 'styles', data.id, beatName);
      await fetchSongs();
      showAppNotice(`Beat added to ${song.song_name}.`);
      return true;
    } catch (err) {
      showAppNotice('Beat add failed: ' + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  function getDuplicateSongName(song) {
    const baseName = `${song.song_name} Copy`;
    const existingNames = new Set(songs.map(item => item.song_name));
    let nextName = baseName;
    let copyNumber = 2;

    while (existingNames.has(nextName)) {
      nextName = `${baseName} ${copyNumber}`;
      copyNumber += 1;
    }

    return nextName;
  }

  function requestDuplicateSong(song) {
    setActionModal({
      type: 'duplicateSong',
      song,
      eyebrow: 'Duplicate song',
      title: `Duplicate ${song.song_name}`,
      message: 'Choose what should be copied into the new song. Anything unchecked will start empty.',
      inputLabel: 'New song name',
      inputValue: getDuplicateSongName(song),
      checkboxLabel: 'Copy into the new song',
      checkboxOptions: [
        {
          name: 'copyLyrics',
          label: 'Lyrics',
          description: song.lyrics?.trim() ? 'Copy saved lyrics.' : 'No lyrics saved yet.',
          defaultChecked: false,
          disabled: !song.lyrics?.trim()
        },
        {
          name: 'copyBeats',
          label: 'Beat settings',
          description: (song.styles || []).length > 0 ? `Copy ${song.styles.length} beat setting${song.styles.length === 1 ? '' : 's'}.` : 'No beats saved yet.',
          defaultChecked: false,
          disabled: (song.styles || []).length === 0
        },
        {
          name: 'copySongDetails',
          label: 'Song notes and metadata',
          description: 'Copy composer, theme, scripture, default key/tempo, and notes.',
          defaultChecked: false
        },
        {
          name: 'copyPlanning',
          label: 'Highlight and presentation plan',
          description: 'Copy highlighted status and planned presentation date.',
          defaultChecked: false
        }
      ],
      confirmText: 'Duplicate Song'
    });
  }

  async function duplicateSong(song, requestedName, options = {}) {
    if (!role.approved) return;

    const {
      copyLyrics = false,
      copyBeats = false,
      copySongDetails = true,
      copyPlanning = false
    } = options;
    const existingNames = new Set(songs.map(item => item.song_name));
    const songName = requestedName?.trim();
    if (!songName) return;

    if (existingNames.has(songName)) {
      showAppNotice('A song with that name already exists.');
      return;
    }

    setSaving(true);

    try {
      const { data: duplicatedSong, error: songErr } = await supabase
        .from('songs')
        .insert({
          song_name: songName,
          lyrics: copyLyrics ? (song.lyrics || null) : null,
          composer: copySongDetails ? (song.composer || null) : null,
          theme: copySongDetails ? (song.theme || null) : null,
          scripture_reference: copySongDetails ? (song.scripture_reference || null) : null,
          default_key: copySongDetails ? (song.default_key || null) : null,
          default_tempo: copySongDetails ? (song.default_tempo || null) : null,
          song_notes: copySongDetails ? (song.song_notes || null) : null,
          is_highlighted: copyPlanning ? Boolean(song.is_highlighted) : false,
          is_hidden: false,
          presentation_date: copyPlanning ? (song.presentation_date || null) : null,
          presentation_owner_id: copyPlanning ? (user?.id || null) : null,
          presentation_marked_at: copyPlanning && song.presentation_date ? new Date().toISOString() : null,
          created_by: user?.id || null
        })
        .select('id')
        .single();

      if (songErr) throw songErr;

      const beatCopies = copyBeats ? (song.styles || []).map(style => ({
        song_id: duplicatedSong.id,
        keyboard_id: style.keyboard_id || null,
        beat_name: style.beat_name,
        keyboard_location: style.keyboard_location || null,
        style_category: style.style_category || null,
        is_favorite: Boolean(style.is_favorite),
        tempo: style.tempo || null,
        musical_key: style.musical_key || null,
        notes: style.notes || null
      })) : [];

      if (beatCopies.length > 0) {
        const { error: beatsErr } = await supabase
          .from('styles')
          .insert(beatCopies);

        if (beatsErr) throw beatsErr;
      }

      await fetchSongs();
    } catch (err) {
      showAppNotice('Duplicate failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleActionModalConfirm(modalResult) {
    if (!actionModal) return;

    const modal = actionModal;
    const inputValue = typeof modalResult === 'string' ? modalResult : modalResult?.inputValue;
    const checkedOptions = modalResult?.checkedOptions || {};

    if (modal.type === 'duplicateSong') {
      await duplicateSong(modal.song, inputValue, checkedOptions);
    }

    if (modal.type === 'deleteEntry') {
      const deleted = await deleteEntry(modal.table, modal.id);
      if (deleted) {
        await recordAuditLog(
          modal.table === 'songs' ? 'song_delete' : 'beat_delete',
          modal.table,
          modal.id,
          modal.targetLabel || modal.title
        );
      }
    }

    if (modal.type === 'songVisibility') {
      await updateSongPlanning(modal.song.id, { is_hidden: modal.nextHidden });
    }

    if (modal.type === 'clearAuditLogs') {
      await clearAuditLogs();
    }

    if (modal.type === 'deleteSuggestion') {
      const { suggestion } = modal;
      const { error } = await supabase
        .from('song_suggestions')
        .delete()
        .eq('id', suggestion.id);

      if (error) {
        showAppNotice('Suggestion delete failed: ' + error.message);
      } else {
        await recordAuditLog('suggestion_delete', 'song_suggestions', suggestion.id, suggestion.song_name);
        await fetchSuggestions();
        showAppNotice('Suggestion deleted.');
      }
    }

    setActionModal(null);
  }

  async function saveLyrics(song, lyrics) {
    if (!role.canEditSongs) {
      showAppNotice('You do not have permission to edit lyrics.');
      return;
    }

    setSaving(true);

    try {
      await updateSongLyrics(song.id, lyrics);
      await recordAuditLog('lyrics_edit', 'songs', song.id, song.song_name);
      setEditingLyricsSong(null);
      await fetchSongs();
    } catch (err) {
      showAppNotice('Lyrics update failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateDefaultKeyboard(nextKeyboardId) {
    setDefaultKeyboardId(nextKeyboardId);
    setFormData(current => ({ ...current, keyboard_id: nextKeyboardId }));

    if (user) {
      await supabase
        .from('profiles')
        .update({ default_keyboard_id: nextKeyboardId || null })
        .eq('id', user.id);
    }
  }

  async function updateLogoutTimeout(nextMinutes) {
    const minutes = Number(nextMinutes);
    setLogoutTimeoutMinutes(minutes);

    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ logout_timeout_minutes: minutes || null })
        .eq('id', user.id);

      if (error) {
        showAppNotice('Logout setting update failed: ' + error.message);
        setLogoutTimeoutMinutes(DEFAULT_INACTIVITY_TIMEOUT_MINUTES);
      }
    }
  }

  function openLibraryView() {
    setStatsSong(null);
    setActiveView('library');
  }

  function openSettingsView() {
    setShowAddForm(false);
    cancelSongEdit();
    setEditingLyricsSong(null);
    setActiveView('settings');
  }

  function openAdminView() {
    setShowAddForm(false);
    cancelSongEdit();
    setEditingLyricsSong(null);
    setActiveView('admin');
  }

  function openLogTrailView() {
    setShowAddForm(false);
    cancelSongEdit();
    setEditingLyricsSong(null);
    setActiveView('logs');
    loadAuditLogs();
  }

  function openReportsView() {
    setShowAddForm(false);
    cancelSongEdit();
    setEditingLyricsSong(null);
    setActiveView('reports');
  }

  function openConsecrationView() {
    setShowAddForm(false);
    cancelSongEdit();
    setEditingLyricsSong(null);
    setActiveView('consecration');
  }

  function openSuggestionsView() {
    setShowAddForm(false);
    cancelSongEdit();
    setEditingLyricsSong(null);
    setActiveView('suggestions');
  }

  function openManualView() {
    setShowAddForm(false);
    cancelSongEdit();
    setEditingLyricsSong(null);
    setActiveView('manual');
  }

  function openSongStats(song) {
    setShowAddForm(false);
    cancelSongEdit();
    setEditingLyricsSong(null);
    setStatsSong(song);
    setActiveView('songStats');
  }

  const visibleSongsForUser = useMemo(
    () => songs.filter(song => role.admin || !song.is_hidden),
    [songs, role.admin]
  );

  const overduePresentationSong = useMemo(() => {
    if (!user || !(role.approved || role.admin) || presentationPromptSong) return null;

    const today = todayDateString();

    return visibleSongsForUser.find(song => {
      if (!song.is_highlighted || !song.presentation_date) return false;
      if (song.presentation_date >= today) return false;
      if (songWasPresentedOn(song, song.presentation_date)) return false;
      return !dismissedOverduePresentationKeys.includes(getPresentationKey(song));
    }) || null;
  }, [visibleSongsForUser, user, role.approved, role.admin, presentationPromptSong, dismissedOverduePresentationKeys]);

  const activePresentationPromptSong = presentationPromptSong || overduePresentationSong;
  const presentationPromptMode = presentationPromptSong ? 'manual' : 'overdue';

  const songNameOptions = useMemo(
    () => [...new Set(visibleSongsForUser.map(song => song.song_name))].sort(),
    [visibleSongsForUser]
  );

  const categories = useMemo(() => {
    const categoryNames = visibleSongsForUser
      .flatMap(song => song.styles || [])
      .map(style => style.keyboard_location?.trim())
      .filter(Boolean);

    return ['All', ...new Set(categoryNames)].sort((a, b) => {
      if (a === 'All') return -1;
      if (b === 'All') return 1;
      return a.localeCompare(b);
    });
  }, [visibleSongsForUser]);

  const beatCategoryMap = useMemo(() => {
    const map = {
      beatToCategories: {},
      categoryToBeats: {}
    };

    songs
      .flatMap(song => song.styles || [])
      .forEach(style => addBeatCategoryMapping(map, style.beat_name, style.keyboard_location));

    consecrationGroups
      .filter(group => group.beat_name !== CONSECRATION_NO_STYLE_GROUP_NAME)
      .forEach(group => addBeatCategoryMapping(map, group.beat_name, group.beat_category));

    Object.keys(map.beatToCategories).forEach(key => {
      map.beatToCategories[key] = sortOptionValues(map.beatToCategories[key]);
    });
    Object.keys(map.categoryToBeats).forEach(key => {
      map.categoryToBeats[key] = sortOptionValues(map.categoryToBeats[key]);
    });

    return map;
  }, [songs, consecrationGroups]);

  const beatCategoryOptions = useMemo(() => {
    const libraryCategoryNames = songs
      .flatMap(song => song.styles || [])
      .map(style => style.keyboard_location?.trim());
    const consecrationCategoryNames = consecrationGroups
      .map(group => group.beat_category?.trim());

    return sortOptionValues([...libraryCategoryNames, ...consecrationCategoryNames]);
  }, [songs, consecrationGroups]);

  const beatNameOptions = useMemo(() => {
    const libraryBeatNames = songs
      .flatMap(song => song.styles || [])
      .map(style => style.beat_name?.trim());
    const consecrationBeatNames = consecrationGroups
      .filter(group => group.beat_name !== CONSECRATION_NO_STYLE_GROUP_NAME)
      .map(group => group.beat_name?.trim());

    return sortOptionValues([...libraryBeatNames, ...consecrationBeatNames]);
  }, [songs, consecrationGroups]);

  const newSongBeatNameOptions = useMemo(
    () => getBeatOptionsForCategory(beatCategoryMap, formData.location, beatNameOptions),
    [beatCategoryMap, formData.location, beatNameOptions]
  );

  const contributors = useMemo(() => {
    const contributorOptions = visibleSongsForUser.map(song => ({
      value: song.created_by || '__unknown__',
      label: song.contributor?.email || 'Unknown contributor'
    }));

    const uniqueContributors = new Map();
    contributorOptions.forEach(contributor => {
      if (!uniqueContributors.has(contributor.value)) {
        uniqueContributors.set(contributor.value, contributor);
      }
    });

    return [
      { value: 'All', label: 'All contributors' },
      ...[...uniqueContributors.values()].sort((a, b) => a.label.localeCompare(b.label))
    ];
  }, [visibleSongsForUser]);

  const filteredSongs = useMemo(
    () => {
      const matchingSongs = visibleSongsForUser.filter(song => {
        const matchesSearch = songMatchesSearch(song, search);
        const matchesCategory = !user
          || selectedCategory === 'All'
          || (song.styles || []).some(style => style.keyboard_location === selectedCategory);
        const matchesContributor = !user || selectedContributor === 'All'
          || (selectedContributor === '__unknown__' ? !song.created_by : song.created_by === selectedContributor);

        return matchesSearch && matchesCategory && matchesContributor;
      });

      return [...matchingSongs].sort((a, b) => {
        if (a.is_highlighted !== b.is_highlighted) {
          return a.is_highlighted ? -1 : 1;
        }

        if (a.is_highlighted && b.is_highlighted) {
          const presentationDiff = getPresentationTimestamp(a) - getPresentationTimestamp(b);
          if (presentationDiff) return presentationDiff;
        }

        if (librarySort === 'name') {
          return a.song_name.localeCompare(b.song_name);
        }

        const latestDiff = getSongLatestTimestamp(b) - getSongLatestTimestamp(a);
        return latestDiff || a.song_name.localeCompare(b.song_name);
      });
    },
    [visibleSongsForUser, search, selectedCategory, selectedContributor, librarySort, user]
  );

  const showContributorPanel = Boolean(user && role.approved && activeView === 'library' && !hideStewardPanel);
  const stewardVerse = STEWARD_VERSES[stewardVerseState.index];
  const activeStatsSong = statsSong
    ? songs.find(song => song.id === statsSong.id) || statsSong
    : null;

  useEffect(() => {
    if (!showContributorPanel) return undefined;

    const intervalId = window.setInterval(() => {
      setStewardVerseState(current => {
        const nextIndex = (current.index + 1) % STEWARD_VERSES.length;
        const previous = [
          current.index,
          ...current.previous.filter(index => index !== current.index)
        ].slice(0, 3);

        return { index: nextIndex, previous };
      });
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [showContributorPanel]);

  function dismissOverduePresentation(song) {
    if (!song) {
      setPresentationPromptSong(null);
      return;
    }

    if (presentationPromptSong) {
      setPresentationPromptSong(null);
      return;
    }

    const nextKeys = [...new Set([...dismissedOverduePresentationKeys, getPresentationKey(song)])];
    setDismissedOverduePresentationKeys(nextKeys);
    window.localStorage.setItem(DISMISSED_OVERDUE_PRESENTATIONS_KEY, JSON.stringify(nextKeys));
  }

  async function confirmPresentedFromModal(song, presentedOn) {
    const success = await markSongPresented(song, presentedOn, { showSuccess: presentationPromptMode === 'manual' });

    if (success) {
      dismissOverduePresentation(song);
    }
  }

  const recentAdditions = useMemo(() => (
    songs
      .flatMap(song => (song.styles || []).map(style => ({
        id: style.id,
        songName: song.song_name,
        beatName: style.beat_name,
        category: style.keyboard_location,
        keyboardName: style.keyboards?.model_name,
        createdAt: style.created_at
      })))
      .filter(item => item.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  ), [songs]);

  const isSuperAdmin = isProtectedOwnerEmail;

  const navButtonStyle = view => ({
    background: activeView === view ? 'rgba(255,255,255,0.22)' : 'transparent',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.24)',
    padding: '6px 10px',
    fontSize: '0.8rem'
  });
  const moreNavActive = ['reports', 'manual', 'settings', 'logs', 'admin'].includes(activeView);

  function openMoreNavPage(openPage) {
    setShowMoreNav(false);
    openPage();
  }

  return (
    <div className="app-shell" style={{ fontFamily: 'system-ui, sans-serif', color: '#222', minHeight: '100vh', background: '#f0f2f7' }}>
      <style>{`
        @media print { .no-print { display: none !important; } }
        * { box-sizing: border-box; }
        input, select, textarea {
          width: 100%; padding: 9px 11px; border: 1px solid #cfd8e3;
          border-radius: 7px; font-family: inherit; font-size: 0.92rem;
          background: #fff; color: #102f4a; caret-color: #1a237e;
          -webkit-text-fill-color: #102f4a; color-scheme: light;
          transition: border-color 0.15s;
        }
        input::placeholder, textarea::placeholder { color: #64748b; opacity: 1; -webkit-text-fill-color: #64748b; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #7fb7d8; box-shadow: 0 0 0 2px rgba(127,183,216,0.18); }
        button { cursor: pointer; border-radius: 6px; border: none; font-weight: 600; transition: all 0.15s; }
        button:hover { opacity: 0.87; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        label { font-size: 0.76rem; font-weight: 700; color: #4a5568; display: block; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.03em; }
        .card { border: 1px solid #e2e8f0; border-radius: 11px; overflow: hidden; background: white; margin-bottom: 13px; box-shadow: 0 1px 5px rgba(0,0,0,0.07); }
        .card-header { background: #dceff8; padding: 11px 16px; display: flex; justify-content: space-between; align-items: center; }
        .song-title { display: inline-block; font-size: 1.08rem; font-weight: 900; color: #17324d; letter-spacing: 0.01em; line-height: 1.2; }
        .beat-count-badge { background: rgba(23,50,77,0.1); color: #315a78; font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; margin-left: 8px; }
        .beat-row { padding: 11px 16px; border-bottom: 1px solid #f0f4f8; }
        .beat-row:last-child { border-bottom: none; }
        .panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 11px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .recent-additions { background: #fff; border: 1px solid #e2e8f0; border-radius: 11px; padding: 10px 14px; margin: 0 0 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
        .recent-additions__toggle { width: 100%; display: flex; align-items: center; gap: 8px; background: transparent; color: #315a78; padding: 2px 0; text-align: left; }
        .recent-additions__title { font-size: 0.98rem; font-weight: 800; flex: 1; }
        .recent-additions__chevron { color: #64748b; font-size: 0.9rem; }
        .recent-additions__item { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-top: 1px solid #f1f5f9; }
        .recent-additions__item strong { color: #1a237e; font-size: 0.9rem; }
        .recent-additions__date { color: #94a3b8; font-size: 0.74rem; white-space: nowrap; }
        .library-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 0 0 14px; }
        .library-stats__item { background: #fff; border: 1px solid #e2e8f0; border-radius: 11px; padding: 12px 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: 8px; }
        .library-stats__icon { grid-row: span 2; font-size: 1.2rem; }
        .library-stats__value { color: #315a78; font-weight: 900; font-size: 1.08rem; line-height: 1; }
        .library-stats__label { color: #64748b; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
        @media (max-width: 700px) { .form-grid { grid-template-columns: 1fr; } .recent-additions__item { flex-direction: column; gap: 3px; } .library-stats { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      <div className="app-header" style={{ background: 'linear-gradient(90deg,#0d1b6e 0%,#1a237e 100%)', padding: '12px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <div className="app-header__brand" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="app-header__mark" style={{ color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: '1.85rem', fontWeight: 900, lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>♫</span>
          <span className="app-header__title" style={{ color: '#fff', fontWeight: '800', fontSize: '1.18rem', letterSpacing: '0.02em' }}>{appTitle}</span>
          {user && !authLoading && (
            role.owner ? <RoleBadge text="SUPER ADMIN" color="#5f9fbd" /> :
            role.admin ? <RoleBadge text="ADMIN" color="#c62828" /> :
            role.approved ? <RoleBadge text="APPROVED" color="#2e7d32" /> :
            <RoleBadge text="PENDING" color="#64748b" />
          )}
        </div>

        <div className="app-header__nav no-print" style={{ display: 'flex', gap: '7px', alignItems: 'center', flexWrap: 'wrap' }}>
          {(role.approved || role.admin) && (
            <>
              <button type="button" onClick={openLibraryView} style={navButtonStyle('library')}>
                Library
              </button>
              <button type="button" onClick={openConsecrationView} style={navButtonStyle('consecration')}>
                Consecration
              </button>
            </>
          )}
          {!authLoading && (
            <button type="button" onClick={openSuggestionsView} style={navButtonStyle('suggestions')}>
              Suggestions
            </button>
          )}
          {user && !authLoading && (
            <div className="app-header__more" ref={moreNavRef}>
              <button
                type="button"
                onClick={() => setShowMoreNav(current => !current)}
                style={navButtonStyle(moreNavActive ? activeView : 'more')}
                aria-expanded={showMoreNav}
              >
                More
              </button>

              {showMoreNav && (
                <div className="app-header__more-menu">
                  {(role.approved || role.admin) && (
                    <button type="button" onClick={() => openMoreNavPage(openReportsView)}>
                      Reports
                    </button>
                  )}
                  <button type="button" onClick={() => openMoreNavPage(openManualView)}>
                    Manual
                  </button>
                  {role.owner && (
                    <button type="button" onClick={() => openMoreNavPage(openSettingsView)}>
                      Settings
                    </button>
                  )}
                  {role.owner && (
                    <button type="button" onClick={() => openMoreNavPage(openLogTrailView)}>
                      Log Trail
                    </button>
                  )}
                  {role.owner && (
                    <button type="button" onClick={() => openMoreNavPage(openAdminView)}>
                      Admin
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          {user ? (
            <button onClick={handleSignOut} className="app-header__logout">
              Logout
            </button>
          ) : (
            <button onClick={() => setShowLoginForm(value => !value)} style={{ background: showLoginForm ? '#455a64' : 'rgba(255,255,255,0.18)', color: '#fff', padding: '7px 14px', fontSize: '0.83rem', border: '1px solid rgba(255,255,255,0.3)' }}>
              {showLoginForm ? '✕ Close' : '🔐 Login'}
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 16px' }}>
        <OfflineBanner visible={!isOnline} />
        {offlineCacheNotice && (
          <div className="offline-banner no-print">
            {offlineCacheNotice}
          </div>
        )}
        {offlineAudioNotice && (
          <div className="offline-banner no-print">
            {offlineAudioNotice}
          </div>
        )}

        {!user && showLoginForm && (
          <div className="panel no-print" style={{ maxWidth: '370px', margin: '0 auto 20px', borderTop: '4px solid #1a237e' }}>
            <h2 style={{ marginTop: 0, marginBottom: '14px', fontSize: '1.05rem', color: '#1a237e' }}>
              {authMode === 'login' ? '🔐 Login' : '📝 Request Access'}
            </h2>
            <form onSubmit={handleAuth} style={{ display: 'grid', gap: '10px' }}>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete={authMode === 'login' ? 'username' : 'email'}
                  required
                />
              </div>
              <div>
                <label>Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', letterSpacing: 0, fontSize: '0.82rem', color: '#1a237e' }}>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={e => setShowPassword(e.target.checked)}
                  style={{ width: 'auto' }}
                />
                Show password
              </label>
              <button type="submit" disabled={authLoading} style={{ background: '#1a237e', color: 'white', padding: '10px', marginTop: '2px' }}>
                {authLoading ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Request Access'}
              </button>
            </form>
            <p onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={{ cursor: 'pointer', color: '#1a237e', marginTop: '12px', textDecoration: 'underline', fontSize: '0.86rem', textAlign: 'center' }}>
              {authMode === 'login' ? 'New user? Create account' : 'Have an account? Login'}
            </p>
          </div>
        )}

        {user && !authLoading && !role.approved && !role.admin && (
          <div className="no-print" style={{ background: '#eef6ff', border: '2px dashed #7fb7d8', padding: '13px 18px', borderRadius: '9px', marginBottom: '16px' }}>
            <strong>⚠️ Your account is pending approval.</strong>
            <p style={{ margin: '5px 0 8px', fontSize: '0.87rem' }}>If you are the first user and no admin exists yet:</p>
            <button onClick={claimAdminBootstrap} style={{ background: '#315a78', color: 'white', padding: '7px 16px', fontSize: '0.85rem' }}>
              🔑 Claim Admin Access
            </button>
          </div>
        )}

        {role.owner && activeView === 'admin' && (
          <section className="panel no-print owner-panel">
            <div>
              <span className="owner-panel__eyebrow">Protected owner account</span>
              <h2>Enock's Music Manager</h2>
              <p>
                This account is protected. It stays approved, keeps super admin access, and cannot be restricted from user management.
              </p>
            </div>
          </section>
        )}

        {showContributorPanel && (
          <section className="panel no-print contributor-panel">
            <div>
              <h2>God bless you {getDisplayName(user.email)} <span aria-hidden="true">❤</span></h2>
              <p key={stewardVerse.reference} className="contributor-panel__verse">
                {stewardVerse.text}
              </p>
              <strong className="contributor-panel__reference">{stewardVerse.reference} KJV</strong>
            </div>

            <button
              type="button"
              className="contributor-panel__hide"
              onClick={() => setHideStewardPanel(true)}
              aria-label="Hide Song Steward encouragement"
              title="Hide this encouragement"
            >
              ×
            </button>
          </section>
        )}

        {activeView === 'consecration' && user && (role.approved || role.admin) && (
          <ConsecrationBeatGroups
            groups={consecrationGroups}
            formData={consecrationFormData}
            onFormChange={setConsecrationFormData}
            onSaveGroup={saveConsecrationBeatGroup}
            onUpdateGroup={updateConsecrationBeatGroup}
            saving={saving}
            canEdit={role.approved || role.admin}
            beatCategoryOptions={beatCategoryOptions}
            beatNameOptions={beatNameOptions}
            beatCategoryMap={beatCategoryMap}
            autoCollapseSubgroups={autoCollapseConsecrationSubgroups}
            onAutoCollapseSubgroupsChange={updateConsecrationAutoCollapseSubgroups}
          />
        )}

        {activeView === 'library' && (
          <div className="library-search-row no-print" style={{ marginBottom: '12px' }}>
            <SearchBar value={search} onChange={setSearch} />
          </div>
        )}

        {activeView === 'library' && (
          <div className="library-toolbar no-print" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {(role.approved || role.admin) && (
              <button onClick={() => { setShowAddForm(value => !value); if (!showAddForm) { setShowFilters(false); setFormData(current => ({ ...current, keyboard_id: defaultKeyboardId || current.keyboard_id })); } }} style={{ background: showAddForm ? '#64748b' : '#5f9fbd', color: 'white', padding: '9px 18px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span>{showAddForm ? '✕' : '➕'}</span>
                {showAddForm ? 'Close Form' : 'Add Song'}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowFilters(current => !current)}
              className="library-toolbar__filter-toggle"
              aria-expanded={showFilters}
            >
              {showFilters ? 'Hide Filters' : 'Filters'}
            </button>

            {user && (
              <span className="library-toolbar__count" style={{ color: '#64748b', fontSize: '0.86rem', fontWeight: 700 }}>
                {search.trim()
                  ? `${filteredSongs.length} of ${visibleSongsForUser.length} song${visibleSongsForUser.length === 1 ? '' : 's'}`
                  : `${visibleSongsForUser.length} song${visibleSongsForUser.length === 1 ? '' : 's'}`}
              </span>
            )}
          </div>
        )}

        {activeView === 'library' && showFilters && !showAddForm && (
          <div className="library-filters-panel no-print">
            <label className="library-toolbar__filter">
              Sort
              <select
                value={librarySort}
                onChange={event => setLibrarySort(event.target.value)}
              >
                <option value="latest">Latest added</option>
                <option value="name">Song name</option>
              </select>
            </label>
            {user && (
              <label className="library-toolbar__filter">
                Category
                <select
                  value={selectedCategory}
                  onChange={event => setSelectedCategory(event.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
            )}
            {user && (
              <label className="library-toolbar__filter library-toolbar__filter--wide">
                Added by
                <select
                  value={selectedContributor}
                  onChange={event => setSelectedContributor(event.target.value)}
                >
                  {contributors.map(contributor => (
                    <option key={contributor.value} value={contributor.value}>{contributor.label}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}

        {role.owner && activeView === 'settings' && (
          <SettingsPage
            appTitle={appTitle}
            defaultKeyboardId={defaultKeyboardId}
            keyboards={keyboards}
            isAdmin={role.owner}
            savingAppTitle={savingAppTitle}
            onAppTitleChange={updateAppTitle}
            onDefaultKeyboardChange={updateDefaultKeyboard}
            logoutTimeoutMinutes={logoutTimeoutMinutes}
            onLogoutTimeoutChange={updateLogoutTimeout}
            autoCollapseConsecrationSubgroups={autoCollapseConsecrationSubgroups}
            onAutoCollapseConsecrationSubgroupsChange={updateConsecrationAutoCollapseSubgroups}
          />
        )}

        {role.owner && activeView === 'admin' && (
          <AdminPage
            profiles={profiles}
            isSuperAdmin={isSuperAdmin}
            currentUserId={user?.id}
            canManageSuperAdmins={role.owner}
            canManageProtectedUsers={role.canManageProtectedUsers}
            onToggleStatus={toggleStatus}
            onToggleActionPermission={toggleActionPermission}
          />
        )}

        {role.owner && activeView === 'logs' && (
          <LogTrailPage
            logs={auditLogs}
            loading={auditLogsLoading}
            saving={saving}
            canClear={role.owner}
            onClearLogs={requestClearAuditLogs}
          />
        )}

        {(role.approved || role.admin) && activeView === 'reports' && (
          <ReportsPage
            recentAdditions={recentAdditions}
            songs={songs}
            keyboards={keyboards}
          />
        )}

        {user && !authLoading && activeView === 'manual' && (
          <ManualPage role={role} />
        )}

        {!authLoading && activeView === 'suggestions' && (
          <SuggestionsPage
            suggestions={suggestions}
            formData={suggestionFormData}
            onFormChange={setSuggestionFormData}
            onSubmit={saveSuggestion}
            onViewDetails={viewSuggestionDetails}
            onDelete={deleteSuggestion}
            existingSongNames={songNameOptions}
            saving={saving}
            canDelete={role.canDeleteSongs}
            canSeeSuggestions={Boolean(user)}
          />
        )}

        {user && !authLoading && activeView === 'songStats' && (
          <SongStatsPage
            song={activeStatsSong}
            onBack={openLibraryView}
          />
        )}

        {role.approved && activeView === 'library' && showAddForm && (
          <form onSubmit={handleSubmit} className="panel no-print app-work-form app-work-form--add" style={{ marginBottom: '18px' }}>
            <div className="app-work-form__banner">
              <span>Adding Song</span>
              <strong>New library entry</strong>
            </div>

            <div>
              <label>Song Name *</label>
              <input placeholder="Type or pick existing song…" value={formData.song_name} onChange={e => setFormData({ ...formData, song_name: e.target.value })} list="song-datalist" required />
              <datalist id="song-datalist">
                {songNameOptions.map(name => <option key={name} value={name} />)}
              </datalist>
              <span style={{ fontSize: '0.71rem', color: '#94a3b8' }}>Existing songs appear as you type</span>
            </div>

            <div style={{ marginTop: '10px' }}>
              <label>Lyrics</label>
              <textarea placeholder="Paste lyrics here…" value={formData.lyrics} onChange={e => setFormData({ ...formData, lyrics: e.target.value })} style={{ minHeight: '130px', resize: 'vertical' }} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '13px', textTransform: 'none', letterSpacing: 0, fontSize: '0.85rem', color: '#1a237e', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.includeBeat}
                onChange={e => setFormData({
                  ...formData,
                  includeBeat: e.target.checked,
                  keyboard_id: e.target.checked ? (formData.keyboard_id || defaultKeyboardId) : formData.keyboard_id
                })}
                style={{ width: 'auto' }}
              />
              Add piano settings
            </label>

            {formData.includeBeat && (
              <>
                <div className="form-grid" style={{ marginTop: '10px' }}>
                  <div>
                    <label>Beat Name</label>
                    <input placeholder="e.g. 8-Beat Modern" value={formData.beat_name} onChange={e => updateFormBeatName(e.target.value)} list="library-beat-name-options" />
                    <datalist id="library-beat-name-options">
                      {newSongBeatNameOptions.map(beatName => (
                        <option key={beatName} value={beatName} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label>Keyboard</label>
                    <select value={formData.keyboard_id} onChange={e => setFormData({ ...formData, keyboard_id: e.target.value })}>
                      <option value="">Select keyboard…</option>
                      {keyboards.map(keyboard => <option key={keyboard.id} value={keyboard.id}>{keyboard.model_name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-grid" style={{ marginTop: '10px' }}>
                  <div>
                    <label>Beat Category</label>
                    <input placeholder="e.g. Ballad, Country, Bank 3…" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} list="library-beat-category-options" />
                    <datalist id="library-beat-category-options">
                      {beatCategoryOptions.map(category => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label>Tempo (BPM)</label>
                    <input placeholder="e.g. 92" type="number" value={formData.tempo} onChange={e => setFormData({ ...formData, tempo: e.target.value })} />
                  </div>
                </div>

                <div className="form-grid" style={{ marginTop: '10px' }}>
                  <div>
                    <label>Key</label>
                    <select value={formData.key} onChange={e => setFormData({ ...formData, key: e.target.value })}>
                      <option value="">Not specified</option>
                      {MUSICAL_KEY_OPTIONS.map(keyOption => (
                        <option key={keyOption} value={keyOption}>{keyOption}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Beat Use</label>
                    <select value={formData.beat_use} onChange={e => setFormData({ ...formData, beat_use: e.target.value })}>
                      <option value="">Not specified</option>
                      <option value="Worship">Worship</option>
                      <option value="Praise">Praise</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid" style={{ marginTop: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', letterSpacing: 0 }}>
                    <input
                      type="checkbox"
                      checked={formData.is_favorite}
                      onChange={e => setFormData({ ...formData, is_favorite: e.target.checked })}
                      style={{ width: 'auto' }}
                    />
                    Preferred beat
                  </label>
                  <div>
                    <label>Beat Notes</label>
                    <input placeholder="Fill levels, variations, intro tips…" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={saving} style={{ marginTop: '13px', width: '100%', background: '#1a237e', color: 'white', padding: '11px', fontSize: '0.97rem' }}>
              {saving ? '⏳ Saving…' : '💾 Save Song'}
            </button>
          </form>
        )}

        {activeView === 'library' && (
        <div>
          {visibleSongsForUser.length === 0 && (
            <p style={{ color: '#aaa', textAlign: 'center', marginTop: '30px' }}>No songs in the library yet.</p>
          )}

          {filteredSongs.map(song => (
            <SongCard
              key={song.id}
              song={song}
              role={role}
              editingId={editingId}
              editData={editData}
              keyboards={keyboards}
              saving={saving}
              onDeleteSong={requestDeleteSong}
              onDeleteBeat={requestDeleteBeat}
              onDuplicateSong={requestDuplicateSong}
              onMarkPresented={setPresentationPromptSong}
              onOpenSongStats={openSongStats}
              onRequestSongVisibilityChange={requestSongVisibilityChange}
              onUpdateSongPlanning={updateSongPlanning}
              onStartSongEdit={startSongEdit}
              onCancelSongEdit={cancelSongEdit}
              onSaveSongEdit={saveSongEdit}
              onEditSongNameChange={setEditSongName}
              onStartEdit={startEdit}
              onCancelEdit={cancelEdit}
              onSaveEdit={saveEdit}
              onAddBeat={addBeatToSong}
              onEditDataChange={setEditData}
              onEditLyrics={setEditingLyricsSong}
              onOpenLyrics={setLyricsSong}
              onSaveLyrics={saveLyrics}
              onNotify={showAppNotice}
              user={user}
              canManageAudio={role?.approved}
              defaultKeyboardId={defaultKeyboardId}
              emptyBeatForm={EMPTY_BEAT_FORM}
              musicalKeyOptions={MUSICAL_KEY_OPTIONS}
              beatCategoryOptions={beatCategoryOptions}
              beatNameOptions={beatNameOptions}
              beatCategoryMap={beatCategoryMap}
              isEditingSong={editingSongId === song.id}
              editSongName={editingSongId === song.id ? editSongName : ''}
              isEditingLyrics={editingLyricsSong?.id === song.id}
            />
          ))}
        </div>
        )}

        <AppFooter />
      </div>

      {lyricsSong && <LyricsMode song={lyricsSong} onClose={() => setLyricsSong(null)} />}
      <PresentationPromptModal
        song={activePresentationPromptSong}
        mode={presentationPromptMode}
        saving={saving}
        onConfirm={presentedOn => confirmPresentedFromModal(activePresentationPromptSong, presentedOn)}
        onDismiss={() => dismissOverduePresentation(activePresentationPromptSong)}
      />
      <ActionModal
        modal={actionModal}
        saving={saving}
        onCancel={() => setActionModal(null)}
        onConfirm={handleActionModalConfirm}
      />
      <NoticeModal
        notice={noticeModal}
        onClose={() => setNoticeModal(null)}
      />
      <InstallPromptModal
        mode={installPromptMode}
        installing={installingApp}
        onInstall={installApp}
        onDismiss={dismissInstallPrompt}
      />
      {offlineAudioPrompt && (
        <div className="app-modal no-print" role="dialog" aria-modal="true" aria-labelledby="offline-audio-title">
          <div className="app-modal__panel">
            <div>
              <span className="app-modal__eyebrow">Offline audio</span>
              <h2 id="offline-audio-title">Save audio for offline use?</h2>
              <p>
                To make audio work offline, the app needs to save {offlineAudioPrompt.items.length} audio file
                {offlineAudioPrompt.items.length === 1 ? '' : 's'} on this device. Estimated mobile data: {offlineAudioPrompt.label}.
              </p>
            </div>

            <div className="app-modal__actions">
              <button
                type="button"
                onClick={() => saveLibraryAudioOffline(offlineAudioPrompt.items)}
                disabled={offlineAudioSaving}
              >
                {offlineAudioSaving ? 'Saving...' : 'Save Offline'}
              </button>
              <button
                type="button"
                onClick={() => {
                  window.sessionStorage.setItem(DISMISSED_OFFLINE_AUDIO_PROMPT_KEY, '1');
                  setOfflineAudioPrompt(null);
                }}
                disabled={offlineAudioSaving}
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppIntegrated;
