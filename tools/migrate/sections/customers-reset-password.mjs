// Combine "customers-reset-password" (no settings) -> main-reset-password.
export default function () {
  return { type: 'main-reset-password', settings: {} };
}
