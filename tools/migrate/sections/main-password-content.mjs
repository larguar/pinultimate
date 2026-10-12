// Combine "main-password-content" (title, rich text, then the store's password message) -> main-password.
export default function (section) {
  const s = section.settings;
  return {
    type: 'main-password',
    settings: {
      title: s.title ?? 'Opening soon',
      ...(s.content !== undefined && { content: s.content }),
    },
  };
}
