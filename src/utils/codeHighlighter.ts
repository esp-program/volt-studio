/**
 * Fast, accurate syntax highlighter for Arduino C++ code
 */

export interface CodeToken {
  type: 'keyword' | 'type' | 'constant' | 'preprocessor' | 'comment' | 'string' | 'number' | 'function' | 'text';
  text: string;
}

const KEYWORDS = new Set([
  'setup', 'loop', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
  'break', 'continue', 'return', 'goto', 'new', 'delete', 'this', 'throw', 'try', 'catch',
  'pinMode', 'digitalWrite', 'digitalRead', 'analogRead', 'analogWrite', 'delay', 'delayMicroseconds',
  'millis', 'micros', 'pulseIn', 'shiftOut', 'shiftIn', 'tone', 'noTone',
  'map', 'constrain', 'abs', 'min', 'max', 'pow', 'sqrt', 'sin', 'cos', 'tan',
  'attachInterrupt', 'detachInterrupt', 'interrupts', 'noInterrupts',
  'Serial', 'Serial1', 'Serial2', 'Serial3', 'WiFi', 'Wire', 'SPI', 'EEPROM', 'ESP',
  'print', 'println', 'begin', 'available', 'read', 'write', 'flush', 'end',
  'operator', 'virtual', 'public', 'private', 'protected', 'typedef', 'namespace', 'using'
]);

const TYPES = new Set([
  'void', 'bool', 'boolean', 'char', 'byte', 'int', 'unsigned', 'long', 'short',
  'float', 'double', 'int8_t', 'int16_t', 'int32_t', 'int64_t',
  'uint8_t', 'uint16_t', 'uint32_t', 'uint64_t', 'size_t', 'word',
  'String', 'struct', 'class', 'enum', 'union', 'auto', 'const', 'static', 'volatile'
]);

const CONSTANTS = new Set([
  'HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP', 'LED_BUILTIN',
  'true', 'false', 'NULL', 'nullptr', 'DEC', 'HEX', 'OCT', 'BIN',
  'WL_CONNECTED', 'WL_IDLE_STATUS', 'WL_NO_SHIELD'
]);

export function highlightCode(code: string): string {
  // Line-by-line escaping and syntax token replacement for safe rendering
  const lines = code.split('\n');
  let inMultiLineComment = false;

  const highlightedLines = lines.map(line => {
    let result = '';
    let i = 0;
    const len = line.length;

    if (inMultiLineComment) {
      const endCommentIdx = line.indexOf('*/');
      if (endCommentIdx === -1) {
        return `<span class="text-slate-500 italic">${escapeHtml(line)}</span>`;
      } else {
        result += `<span class="text-slate-500 italic">${escapeHtml(line.slice(0, endCommentIdx + 2))}</span>`;
        i = endCommentIdx + 2;
        inMultiLineComment = false;
      }
    }

    while (i < len) {
      // Check multi-line comment start
      if (line.slice(i, i + 2) === '/*') {
        const endCommentIdx = line.indexOf('*/', i + 2);
        if (endCommentIdx === -1) {
          result += `<span class="text-slate-500 italic">${escapeHtml(line.slice(i))}</span>`;
          inMultiLineComment = true;
          break;
        } else {
          result += `<span class="text-slate-500 italic">${escapeHtml(line.slice(i, endCommentIdx + 2))}</span>`;
          i = endCommentIdx + 2;
          continue;
        }
      }

      // Check single-line comment
      if (line.slice(i, i + 2) === '//') {
        result += `<span class="text-slate-500 italic">${escapeHtml(line.slice(i))}</span>`;
        break;
      }

      // Check preprocessor directive
      if (line[i] === '#' && (i === 0 || /^\s*$/.test(line.slice(0, i)))) {
        // Read preprocessor
        const prepMatch = line.slice(i).match(/^#[a-zA-Z0-9_]+/);
        if (prepMatch) {
          result += `<span class="text-amber-400 font-semibold">${escapeHtml(prepMatch[0])}</span>`;
          i += prepMatch[0].length;
          continue;
        }
      }

      // Check Strings
      if (line[i] === '"' || line[i] === "'") {
        const quote = line[i];
        let j = i + 1;
        while (j < len && (line[j] !== quote || line[j - 1] === '\\')) {
          j++;
        }
        if (j < len) j++; // include closing quote
        result += `<span class="text-emerald-300">${escapeHtml(line.slice(i, j))}</span>`;
        i = j;
        continue;
      }

      // Check Numbers
      if (/\d/.test(line[i]) && (i === 0 || !/[a-zA-Z0-9_]/.test(line[i - 1]))) {
        const numMatch = line.slice(i).match(/^(0x[0-9a-fA-F]+|\d+(\.\d+)?([eE][+-]?\d+)?f?)/);
        if (numMatch) {
          result += `<span class="text-purple-300 font-mono">${escapeHtml(numMatch[0])}</span>`;
          i += numMatch[0].length;
          continue;
        }
      }

      // Check Identifiers & Words
      if (/[a-zA-Z_]/.test(line[i])) {
        const wordMatch = line.slice(i).match(/^[a-zA-Z0-9_]+/);
        if (wordMatch) {
          const word = wordMatch[0];
          // Check if followed by '(' -> function
          const rest = line.slice(i + word.length).trimStart();
          const isFunc = rest.startsWith('(');

          if (KEYWORDS.has(word)) {
            result += `<span class="text-cyan-400 font-semibold">${escapeHtml(word)}</span>`;
          } else if (TYPES.has(word)) {
            result += `<span class="text-blue-400 font-medium">${escapeHtml(word)}</span>`;
          } else if (CONSTANTS.has(word)) {
            result += `<span class="text-amber-300 font-medium">${escapeHtml(word)}</span>`;
          } else if (isFunc) {
            result += `<span class="text-yellow-300">${escapeHtml(word)}</span>`;
          } else {
            result += `<span class="text-slate-200">${escapeHtml(word)}</span>`;
          }
          i += word.length;
          continue;
        }
      }

      // Special characters
      result += escapeHtml(line[i]);
      i++;
    }

    return result || '&nbsp;';
  });

  return highlightedLines.join('\n');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
