/**
 * @module utils
 * @author nuintun
 */

const HTML_ESCAPE_MAP = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&#39;',
  '"': '&quot;'
};

export function escapeHTML(html) {
  return String(html).replace(/[<>&'"]/g, char => HTML_ESCAPE_MAP[char]);
}
