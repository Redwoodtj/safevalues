/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {createHtml, SafeHtml, unwrapHtml} from '../internals/html_impl';
import {TrustedResourceUrl, unwrapResourceUrl} from '../internals/resource_url_impl';
import {SafeScript, unwrapScript} from '../internals/script_impl';

/**
 * Returns HTML-escaped text as a `SafeHtml` object.
 *
 * Available options:
 * - `preserveSpaces` turns every second consecutive space character into its
 * HTML entity representation (`&#160;`).
 * - `preserveNewlines` turns newline characters into breaks (`<br>`).
 * - `preserveTabs` wraps tab characters in a span with style=white-space:pre.
 */
export function htmlEscape(text: string, options: {
  preserveNewlines?: boolean,
  preserveSpaces?: boolean,
  preserveTabs?: boolean
} = {}): SafeHtml {
  let htmlEscapedString = htmlEscapeToString(text);
  if (options.preserveSpaces) {
    // Do this first to ensure we preserve spaces after newlines and tabs.
    htmlEscapedString =
        htmlEscapedString.replace(/(^|[\r\n\t ]) /g, '$1&#160;');
  }
  if (options.preserveNewlines) {
    htmlEscapedString = htmlEscapedString.replace(/(\r\n|\n|\r)/g, '<br>');
  }
  if (options.preserveTabs) {
    htmlEscapedString = htmlEscapedString.replace(
        /(\t+)/g, '<span style="white-space:pre">$1</span>');
  }
  return createHtml(htmlEscapedString);
}

/**
 * Creates a `SafeHtml` representing a script tag with inline script content.
 */
export function scriptToHtml(script: SafeScript, options: {
  id?: string,
  nonce?: string,
  type?: string,
} = {}): SafeHtml {
  const unwrappedScript = unwrapScript(script).toString();
  let stringTag = `<script`;
  if (options.id) {
    stringTag += ` id="${htmlEscapeToString(options.id)}"`;
  }
  if (options.nonce) {
    stringTag += ` nonce="${htmlEscapeToString(options.nonce)}"`;
  }
  if (options.type) {
    stringTag += ` type="${htmlEscapeToString(options.type)}"`;
  }
  stringTag += `>${unwrappedScript}\x3c/script>`;
  return createHtml(stringTag);
}

/**
 * Creates a `SafeHtml` representing a script tag with the src attribute.
 * This also supports CSP nonces and async loading.
 */
export function scriptUrlToHtml(src: TrustedResourceUrl, options: {
  async?: boolean,
  nonce?: string,
} = {}): SafeHtml {
  const unwrappedSrc = unwrapResourceUrl(src).toString();
  let stringTag = `<script src="${htmlEscapeToString(unwrappedSrc)}"`;
  if (options.async) {
    stringTag += ' async';
  }
  if (options.nonce) {
    stringTag += ` nonce="${htmlEscapeToString(options.nonce)}"`;
  }
  stringTag += '>\x3c/script>';
  return createHtml(stringTag);
}

/**
 * HTML-escapes the given text (`&`, `<`, `>`, `"` and `'`).
 */
function htmlEscapeToString(text: string): string {
  const escaped = text.replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;')
                      .replace(/'/g, '&apos;');
  return escaped;
}

/** Creates a `SafeHtml` value by concatenating multiple `SafeHtml`s. */
export function concatHtmls(htmls: readonly SafeHtml[]): SafeHtml {
  return createHtml(htmls.map(unwrapHtml).join(''));
}
