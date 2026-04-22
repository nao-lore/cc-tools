/**
 * HTML to Markdown converter using DOMParser API.
 * Handles 20 common HTML elements without external libraries.
 */

function escapeMarkdown(text: string): string {
  return text.replace(/([\\`*_{}[\]()#+\-.!|])/g, '\\$1');
}

function repeat(str: string, count: number): string {
  return str.repeat(Math.max(0, count));
}

function trimLines(text: string): string {
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

function getTextContent(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || '';
  }
  let text = '';
  node.childNodes.forEach((child) => {
    text += getTextContent(child);
  });
  return text;
}

function convertNode(node: Node): string {
  // Text node
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || '';
    // Preserve whitespace but normalize excessive spaces
    return text.replace(/[ \t]+/g, ' ');
  }

  // Not an element node
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  switch (tag) {
    // Headings
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      const level = parseInt(tag[1]);
      const content = convertChildren(el).trim();
      return `\n\n${repeat('#', level)} ${content}\n\n`;
    }

    // Paragraph
    case 'p': {
      const content = convertChildren(el).trim();
      if (!content) return '';
      return `\n\n${content}\n\n`;
    }

    // Line break
    case 'br':
      return '  \n';

    // Horizontal rule
    case 'hr':
      return '\n\n---\n\n';

    // Bold
    case 'strong':
    case 'b': {
      const content = convertChildren(el).trim();
      if (!content) return '';
      return `**${content}**`;
    }

    // Italic
    case 'em':
    case 'i': {
      const content = convertChildren(el).trim();
      if (!content) return '';
      return `*${content}*`;
    }

    // Strikethrough
    case 'del':
    case 's':
    case 'strike': {
      const content = convertChildren(el).trim();
      if (!content) return '';
      return `~~${content}~~`;
    }

    // Links
    case 'a': {
      const href = el.getAttribute('href') || '';
      const content = convertChildren(el).trim();
      const title = el.getAttribute('title');
      if (!content) return '';
      if (title) {
        return `[${content}](${href} "${title}")`;
      }
      return `[${content}](${href})`;
    }

    // Images
    case 'img': {
      const src = el.getAttribute('src') || '';
      const alt = el.getAttribute('alt') || '';
      const title = el.getAttribute('title');
      if (title) {
        return `![${alt}](${src} "${title}")`;
      }
      return `![${alt}](${src})`;
    }

    // Inline code
    case 'code': {
      // If parent is <pre>, don't wrap in backticks
      if (el.parentElement?.tagName.toLowerCase() === 'pre') {
        return el.textContent || '';
      }
      const content = el.textContent || '';
      if (!content) return '';
      // Use double backticks if content contains backtick
      if (content.includes('`')) {
        return `\`\` ${content} \`\``;
      }
      return `\`${content}\``;
    }

    // Code blocks
    case 'pre': {
      const codeEl = el.querySelector('code');
      const content = codeEl ? (codeEl.textContent || '') : (el.textContent || '');
      // Try to detect language from class
      let lang = '';
      if (codeEl) {
        const className = codeEl.getAttribute('class') || '';
        const match = className.match(/language-(\w+)/);
        if (match) lang = match[1];
      }
      return `\n\n\`\`\`${lang}\n${content}\n\`\`\`\n\n`;
    }

    // Blockquote
    case 'blockquote': {
      const content = convertChildren(el).trim();
      if (!content) return '';
      const lines = content.split('\n');
      const quoted = lines.map((line) => `> ${line}`).join('\n');
      return `\n\n${quoted}\n\n`;
    }

    // Unordered list
    case 'ul': {
      const items = convertListItems(el, 'ul');
      return `\n\n${items}\n\n`;
    }

    // Ordered list
    case 'ol': {
      const items = convertListItems(el, 'ol');
      return `\n\n${items}\n\n`;
    }

    // List item - handled by convertListItems
    case 'li': {
      return convertChildren(el).trim();
    }

    // Table
    case 'table': {
      return `\n\n${convertTable(el)}\n\n`;
    }

    // Table sub-elements - skip direct handling, handled by convertTable
    case 'thead':
    case 'tbody':
    case 'tfoot':
    case 'tr':
    case 'th':
    case 'td':
      return convertChildren(el);

    // Div, section, article, main, header, footer, nav - block elements
    case 'div':
    case 'section':
    case 'article':
    case 'main':
    case 'header':
    case 'footer':
    case 'nav':
    case 'aside': {
      const content = convertChildren(el).trim();
      if (!content) return '';
      return `\n\n${content}\n\n`;
    }

    // Span and other inline elements
    case 'span':
    case 'small':
    case 'mark':
    case 'abbr':
    case 'cite':
    case 'dfn':
    case 'sub':
    case 'sup':
      return convertChildren(el);

    // Figure
    case 'figure': {
      return `\n\n${convertChildren(el).trim()}\n\n`;
    }

    // Figcaption
    case 'figcaption': {
      const content = convertChildren(el).trim();
      return content ? `\n*${content}*\n` : '';
    }

    // Definition list
    case 'dl': {
      return `\n\n${convertChildren(el).trim()}\n\n`;
    }
    case 'dt': {
      const content = convertChildren(el).trim();
      return `\n**${content}**\n`;
    }
    case 'dd': {
      const content = convertChildren(el).trim();
      return `: ${content}\n`;
    }

    // Skip script, style, etc.
    case 'script':
    case 'style':
    case 'link':
    case 'meta':
    case 'head':
    case 'title':
      return '';

    // Default: just process children
    default:
      return convertChildren(el);
  }
}

function convertChildren(el: HTMLElement): string {
  let result = '';
  el.childNodes.forEach((child) => {
    result += convertNode(child);
  });
  return result;
}

function convertListItems(el: HTMLElement, type: 'ul' | 'ol', indent: number = 0): string {
  const items: string[] = [];
  let index = 1;

  el.childNodes.forEach((child) => {
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const childEl = child as HTMLElement;
    if (childEl.tagName.toLowerCase() !== 'li') return;

    const prefix = type === 'ul' ? '- ' : `${index}. `;
    const indentStr = repeat('  ', indent);

    // Process li children, separating nested lists
    let textContent = '';
    let nestedLists = '';

    childEl.childNodes.forEach((liChild) => {
      if (liChild.nodeType === Node.ELEMENT_NODE) {
        const liChildEl = liChild as HTMLElement;
        const childTag = liChildEl.tagName.toLowerCase();
        if (childTag === 'ul' || childTag === 'ol') {
          nestedLists += '\n' + convertListItems(liChildEl, childTag as 'ul' | 'ol', indent + 1);
          return;
        }
      }
      textContent += convertNode(liChild);
    });

    const line = `${indentStr}${prefix}${textContent.trim()}`;
    items.push(line + nestedLists);
    index++;
  });

  return items.join('\n');
}

function convertTable(table: HTMLElement): string {
  const rows: string[][] = [];
  const headerRows: string[][] = [];

  // Collect all rows
  const allRows = table.querySelectorAll('tr');
  allRows.forEach((tr) => {
    const cells: string[] = [];
    let isHeader = false;
    tr.querySelectorAll('th, td').forEach((cell) => {
      if (cell.tagName.toLowerCase() === 'th') isHeader = true;
      cells.push(convertChildren(cell as HTMLElement).trim().replace(/\|/g, '\\|'));
    });
    if (isHeader) {
      headerRows.push(cells);
    } else {
      rows.push(cells);
    }
  });

  // If no header rows, use the first row as header
  if (headerRows.length === 0 && rows.length > 0) {
    headerRows.push(rows.shift()!);
  }

  if (headerRows.length === 0) return '';

  const colCount = Math.max(
    ...headerRows.map((r) => r.length),
    ...rows.map((r) => r.length)
  );

  // Normalize rows to same column count
  const normalize = (row: string[]) => {
    while (row.length < colCount) row.push('');
    return row;
  };

  const lines: string[] = [];

  // Header
  const header = normalize(headerRows[0]);
  lines.push(`| ${header.join(' | ')} |`);

  // Separator
  const sep = header.map(() => '---');
  lines.push(`| ${sep.join(' | ')} |`);

  // Additional header rows as body
  for (let i = 1; i < headerRows.length; i++) {
    const row = normalize(headerRows[i]);
    lines.push(`| ${row.join(' | ')} |`);
  }

  // Body rows
  rows.forEach((row) => {
    const normalized = normalize(row);
    lines.push(`| ${normalized.join(' | ')} |`);
  });

  return lines.join('\n');
}

export function htmlToMarkdown(html: string): string {
  if (!html.trim()) return '';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // If there's a body, convert its children
    const body = doc.body;
    if (!body) return '';

    const result = convertChildren(body);
    return trimLines(result);
  } catch {
    return '<!-- Error parsing HTML -->';
  }
}
