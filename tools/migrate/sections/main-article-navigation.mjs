// Combine "main-article-navigation" -> main-article-navigation (previous / next post cards).
import { cardSettings } from './main-blog.mjs';

export default function (section) {
  const s = section.settings || {};
  const { show_card_tags, tags_limit, show_button, button_label, ...card } = cardSettings(section);
  const settings = {
    heading: s.title ?? 'More articles',
    ...card,
    show_tags: show_card_tags,
    tags_limit,
    show_button,
    button_label,
  };
  if (s.blog_previous) settings.previous_article = s.blog_previous;
  if (s.blog_next) settings.next_article = s.blog_next;
  return { type: 'main-article-navigation', settings };
}
