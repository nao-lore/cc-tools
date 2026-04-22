export interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
  auth: { user: string; password: string } | null;
  isJson: boolean;
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  const s = input.trim();

  while (i < s.length) {
    // Skip whitespace and line continuations
    if (s[i] === '\\' && (s[i + 1] === '\n' || s[i + 1] === '\r')) {
      i += 2;
      while (i < s.length && (s[i] === ' ' || s[i] === '\t' || s[i] === '\r' || s[i] === '\n')) i++;
      continue;
    }
    if (s[i] === ' ' || s[i] === '\t' || s[i] === '\n' || s[i] === '\r') {
      i++;
      continue;
    }
    // Single-quoted string
    if (s[i] === "'") {
      let j = i + 1;
      let token = '';
      while (j < s.length && s[j] !== "'") {
        token += s[j++];
      }
      tokens.push(token);
      i = j + 1;
      continue;
    }
    // Double-quoted string
    if (s[i] === '"') {
      let j = i + 1;
      let token = '';
      while (j < s.length) {
        if (s[j] === '\\' && j + 1 < s.length) {
          token += s[j + 1];
          j += 2;
        } else if (s[j] === '"') {
          j++;
          break;
        } else {
          token += s[j++];
        }
      }
      tokens.push(token);
      i = j;
      continue;
    }
    // Unquoted token
    let j = i;
    while (j < s.length && s[j] !== ' ' && s[j] !== '\t' && s[j] !== '\n' && s[j] !== '\r') {
      if (s[j] === '\\' && (s[j + 1] === '\n' || s[j + 1] === '\r')) break;
      j++;
    }
    tokens.push(s.slice(i, j));
    i = j;
  }

  return tokens;
}

export function parseCurl(input: string): ParsedCurl {
  const result: ParsedCurl = {
    method: 'GET',
    url: '',
    headers: {},
    body: null,
    auth: null,
    isJson: false,
  };

  const tokens = tokenize(input);
  if (!tokens.length || tokens[0].toLowerCase() !== 'curl') {
    return result;
  }

  let i = 1;
  let explicitMethod = false;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token === '-X' || token === '--request') {
      result.method = (tokens[++i] || 'GET').toUpperCase();
      explicitMethod = true;
      i++;
      continue;
    }

    if (token === '-H' || token === '--header') {
      const header = tokens[++i] || '';
      const colonIdx = header.indexOf(':');
      if (colonIdx !== -1) {
        const key = header.slice(0, colonIdx).trim();
        const value = header.slice(colonIdx + 1).trim();
        result.headers[key] = value;
        if (key.toLowerCase() === 'content-type' && value.toLowerCase().includes('application/json')) {
          result.isJson = true;
        }
      }
      i++;
      continue;
    }

    if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-ascii') {
      result.body = tokens[++i] || '';
      if (!explicitMethod) result.method = 'POST';
      // Try to detect JSON body
      const trimmed = result.body.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        result.isJson = true;
      }
      i++;
      continue;
    }

    if (token === '--data-urlencode') {
      result.body = tokens[++i] || '';
      if (!explicitMethod) result.method = 'POST';
      i++;
      continue;
    }

    if (token === '-u' || token === '--user') {
      const userpass = tokens[++i] || '';
      const colonIdx = userpass.indexOf(':');
      if (colonIdx !== -1) {
        result.auth = {
          user: userpass.slice(0, colonIdx),
          password: userpass.slice(colonIdx + 1),
        };
      } else {
        result.auth = { user: userpass, password: '' };
      }
      i++;
      continue;
    }

    if (token === '-A' || token === '--user-agent') {
      result.headers['User-Agent'] = tokens[++i] || '';
      i++;
      continue;
    }

    if (token === '--compressed' || token === '-s' || token === '--silent' ||
        token === '-v' || token === '--verbose' || token === '-i' || token === '--include' ||
        token === '-L' || token === '--location' || token === '-k' || token === '--insecure') {
      i++;
      continue;
    }

    if (token === '-o' || token === '--output' || token === '--connect-timeout' ||
        token === '--max-time' || token === '-m' || token === '--proxy' || token === '-x') {
      i += 2; // skip flag and its value
      continue;
    }

    // URL: starts with http or https, or doesn't start with -
    if (!token.startsWith('-') && !result.url) {
      result.url = token;
      i++;
      continue;
    }

    i++;
  }

  return result;
}
