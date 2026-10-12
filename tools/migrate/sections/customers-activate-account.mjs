// Combine "customers-activate-account" (no settings) -> main-activate-account.
export default function () {
  return { type: 'main-activate-account', settings: {} };
}
