/**
 * Simple Markdown to HTML renderer for preview.
 * Handles the most common markdown syntax.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function markdownToHtml(markdown: string): string {
  if (!markdown.trim()) return '';

  let html = markdown;

  // Code blocks (fenced) - must be processed first
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const escaped = escapeHtml(code.trimEnd());
    return `<pre><code class="language-${lang}">${escaped}</code></pre>`;
  });

  // Split into lines for block-level processing
  const lines = html.split('\n');
  const output: string[] = [];
  let inList = false;
  let listType = '';
  let inBlockquote = false;
  let inTable = false;
  let tableLines: string[] = [];

  function closeList() {
    if (inList) {
      output.push(listType === 'ul' ? '</ul>' : '</ol>');
      inList = false;
    }
  }

  function closeBlockquote() {
    if (inBlockquote) {
      output.push('</blockquote>');
      inBlockquote = false;
    }
  }

  function closeTable() {
    if (inTable && tableLines.length > 0) {
      output.push(renderTable(tableLines));
      tableLines = [];
      inTable = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Skip lines inside pre blocks
    if (line.startsWith('<pre>')) {
      closeList();
      closeBlockquote();
      closeTable();
      output.push(line);
      while (i < lines.length - 1 && !lines[i].includes('</pre>')) {
        i++;
        output.push(lines[i]);
      }
      continue;
    }

    // Table detection
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      closeList();
      closeBlockquote();
      if (!inTable) {
        inTable = true;
        tableLines = [];
      }
      tableLines.push(line);
      continue;
    } else {
      closeTable();
    }

    // Horizontal rule
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
      closeList();
      closeBlockquote();
      output.push('<hr>');
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      closeList();
      closeBlockquote();
      const level = headingMatch[1].length;
      const content = processInline(headingMatch[2]);
      output.push(`<h${level}>${content}</h${level}>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      closeList();
      if (!inBlockquote) {
        output.push('<blockquote>');
        inBlockquote = true;
      }
      const content = processInline(line.slice(2));
      output.push(`<p>${content}</p>`);
      continue;
    } else {
      closeBlockquote();
    }

    // Unordered list
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
    if (ulMatch) {
      closeBlockquote();
      if (!inList || listType !== 'ul') {
        closeList();
        output.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      output.push(`<li>${processInline(ulMatch[2])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (olMatch) {
      closeBlockquote();
      if (!inList || listType !== 'ol') {
        closeList();
        output.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      output.push(`<li>${processInline(olMatch[2])}</li>`);
      continue;
    }

    // Close list if we're no longer in one
    closeList();

    // Empty line
    if (line.trim() === '') {
      continue;
    }

    // Paragraph
    output.push(`<p>${processInline(line)}</p>`);
  }

  closeList();
  closeBlockquote();
  closeTable();

  return output.join('\n');
}

function processInline(text: string): string {
  // Inline code (must be first to avoid processing inside code)
  text = text.replace(/``(.+?)``/g, '<code>$1</code>');
  text = text.replace(/`(.+?)`/g, '<code>$1</code>');

  // Images (must be before links)
  text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_m, alt, src, title) => {
    return title
      ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" title="${escapeHtml(title)}">`
      : `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`;
  });

  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_m, label, href, title) => {
    return title
      ? `<a href="${escapeHtml(href)}" title="${escapeHtml(title)}">${label}</a>`
      : `<a href="${escapeHtml(href)}">${label}</a>`;
  });

  // Bold + Italic
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');

  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Strikethrough
  text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Line break (two trailing spaces)
  text = text.replace(/ {2}$/g, '<br>');

  return text;
}

function renderTable(lines: string[]): string {
  if (lines.length < 2) return lines.join('\n');

  const parseRow = (line: string) =>
    line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

  const headers = parseRow(lines[0]);
  // Skip separator line (line[1])
  const bodyRows = lines.slice(2).map(parseRow);

  let html = '<table><thead><tr>';
  headers.forEach((h) => {
    html += `<th>${processInline(h)}</th>`;
  });
  html += '</tr></thead>';

  if (bodyRows.length > 0) {
    html += '<tbody>';
    bodyRows.forEach((row) => {
      html += '<tr>';
      row.forEach((cell) => {
        html += `<td>${processInline(cell)}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody>';
  }

  html += '</table>';
  return html;
}
