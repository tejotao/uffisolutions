
// Remembers which free product's language a not-yet-registered visitor was
// looking at when they clicked "get it free" and were sent to /register.
// The dashboard reads this once, on the new profile's first load, so the
// free-resources list matches what the visitor actually came for instead of
// always defaulting to Portuguese.
const STORAGE_KEY = 'uffi_signup_intent_lang';

export const rememberSignupIntentLanguage = (language) => {
  if (!language) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, language.toLowerCase().split('-')[0]);
  } catch {
    // localStorage unavailable (private browsing, etc.) — safe to ignore,
    // the dashboard just falls back to the default language.
  }
};

/** Reads and clears the stored intent — meant to be consumed exactly once. */
export const consumeSignupIntentLanguage = () => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    window.localStorage.removeItem(STORAGE_KEY);
    return value;
  } catch {
    return null;
  }
};
