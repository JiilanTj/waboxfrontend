import React from 'react';

// Replace literal "/n" with real newlines
export const normalizeWhatsAppNewlines = (text: string): string => {
  if (!text) return text;
  return text.replace(/\/n/g, '\n');
};

// Small helper to render invisible characters that still take space
const InvisibleMarker: React.FC<{ c: string; k?: string }> = ({ c, k }) => (
  <span
    key={k}
    aria-hidden
    className="text-transparent select-none pointer-events-none"
    style={{ opacity: 0 }}
  >
    {c}
  </span>
);

// Apply regex patterns sequentially on nodes
const applyPattern = (
  nodes: Array<string | React.ReactNode>,
  regex: RegExp,
  wrap: (match: string, key: string) => React.ReactNode
): Array<string | React.ReactNode> => {
  const out: Array<string | React.ReactNode> = [];
  nodes.forEach((node, i) => {
    if (typeof node !== 'string') {
      out.push(node);
      return;
    }
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const keyBase = `${regex.source}-${i}`;
    const r = new RegExp(regex.source, regex.flags); // fresh regex for each node
    while ((match = r.exec(node)) !== null) {
      const [full, inner] = match;
      const start = match.index;
      const end = start + full.length;
      if (start > lastIndex) out.push(node.slice(lastIndex, start));
      out.push(wrap(inner, `${keyBase}-${start}`));
      lastIndex = end;
    }
    if (lastIndex < node.length) out.push(node.slice(lastIndex));
  });
  return out;
};

// Render simple WhatsApp-like formatting: *bold*, _italic_
// options.preview: when true, simulate bold/italic without affecting layout metrics
export const renderWhatsAppFormatted = (
  raw: string,
  options?: { preview?: boolean }
): React.ReactNode => {
  if (!raw) return null;
  const text = normalizeWhatsAppNewlines(raw);
  const preview = !!options?.preview;

  // Start with a single string node
  let nodes: Array<string | React.ReactNode> = [text];

  if (preview) {
    // In preview mode we simulate bold/italic to avoid changing layout width
    nodes = applyPattern(nodes, /\*([^*]+)\*/g, (m, key) => (
      <React.Fragment key={key}>
        <InvisibleMarker c="*" k={`${key}-s`} />
        <span
          // Fake bold using text-shadow (paint only, no layout change)
          style={{
            fontWeight: 'normal',
            textShadow:
              '0.03em 0 currentColor, -0.03em 0 currentColor, 0 0.03em currentColor, 0 -0.03em currentColor',
          }}
        >
          {m}
        </span>
        <InvisibleMarker c="*" k={`${key}-e`} />
      </React.Fragment>
    ));
    nodes = applyPattern(nodes, /_([^_]+)_/g, (m, key) => (
      <React.Fragment key={key}>
        <InvisibleMarker c="_" k={`${key}-s`} />
        <span
          // Fake italic using skew transform (transform doesn't affect layout width)
          style={{ display: 'inline-block', transform: 'skewX(-12deg)' }}
        >
          {m}
        </span>
        <InvisibleMarker c="_" k={`${key}-e`} />
      </React.Fragment>
    ));
  } else {
    // Real formatting for normal rendering (MessageList, etc.)
    nodes = applyPattern(nodes, /\*([^*]+)\*/g, (m, key) => (
      <React.Fragment key={key}>
        <InvisibleMarker c="*" k={`${key}-s`} />
        <strong>{m}</strong>
        <InvisibleMarker c="*" k={`${key}-e`} />
      </React.Fragment>
    ));
    nodes = applyPattern(nodes, /_([^_]+)_/g, (m, key) => (
      <React.Fragment key={key}>
        <InvisibleMarker c="_" k={`${key}-s`} />
        <em>{m}</em>
        <InvisibleMarker c="_" k={`${key}-e`} />
      </React.Fragment>
    ));
  }

  // Split by lines and interleave <br />
  const withBreaks: React.ReactNode[] = [];
  nodes.forEach((node, idx) => {
    if (typeof node !== 'string') {
      withBreaks.push(node);
      return;
    }
    const parts = node.split('\n');
    parts.forEach((part, pIdx) => {
      withBreaks.push(part);
      if (pIdx < parts.length - 1) withBreaks.push(<br key={`br-${idx}-${pIdx}`} />);
    });
  });

  return <>{withBreaks}</>;
};
