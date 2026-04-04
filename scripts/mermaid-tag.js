/**
 * Hexo plugin to register mermaid tag for rendering diagrams
 * This handles the {% mermaid %}...{% endmermaid %} syntax
 */

'use strict';

function mermaidTag(args, content) {
  // Wrap the content in a div with mermaid class
  // Use base64 encoding to preserve formatting and line breaks
  const preservedContent = content.trim();
  // Use UTF-8 safe base64 encoding
  const encodedContent = Buffer.from(preservedContent, 'utf-8').toString('base64');
  return `<mermaid data="${encodedContent}"></mermaid>`;
}

// Register the tag with Hexo
hexo.extend.tag.register('mermaid', mermaidTag, {ends: true});