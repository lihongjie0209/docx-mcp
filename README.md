# docx-mcp

A Node.js MCP server that lets clients create, query, edit, and save DOCX documents using a JSON schema, powered by the `docx` library.

## Features
- JSON Schema describing a simplified DOCX structure
- Create/Open documents -> returns an in-memory id
- Query metadata and top-level object info
- Edit metadata and content blocks (insert/replace/remove)
- Save by id to disk

## JSON Schema
See `src/schema.ts` for the full schema. Key concepts:
- meta: document metadata (title, subject, creator, ...)
- content: array of blocks: heading, paragraph, table, image
- Each paragraph/heading uses inline runs (text, hyperlink)

## Run locally
1. Install deps

```pwsh
npm install
```

2. Dev mode

```pwsh
npm run dev
```

3. Build and start

```pwsh
npm run build
npm start
```

## Tools
- docx-getSchema { } // Get JSON schema - call this first!
- docx-create { json }
- docx-open { id?, path }  // open .docx file from disk
- docx-queryMeta { id }
- docx-queryObjects { id }
- docx-editMeta { id, patch }
- docx-editContent { id, index, block }
- docx-insertContent { id, index, block }
- docx-removeContent { id, index }
- docx-save { id, path }
- docx-exportJson { id }

## Example JSON
```json
{
  "meta": { "title": "Demo", "creator": "me" },
  "content": [
    { "type": "heading", "level": 1, "children": [ { "type": "text", "text": "Title" } ] },
    { "type": "paragraph", "children": [ { "type": "text", "text": "Hello ", "bold": true }, { "type": "text", "text": "world" } ] },
    { "type": "image", "url": "https://picsum.photos/300/200", "width": 300, "height": 200 },
    { "type": "image", "data": "base64data...", "format": "png", "width": 150, "height": 100 },
    { "type": "table", "rows": [ { "cells": [ { "children": [ { "type": "paragraph", "children": [ { "type": "text", "text": "A" } ] } ] }, { "children": [ { "type": "paragraph", "children": [ { "type": "text", "text": "B" } ] } ] } ] } ] }
  ]
}
```

## Image Support
Images can be included in three ways:
- **URL**: `{ "type": "image", "url": "https://example.com/image.png", "width": 300, "height": 200 }`
- **Local file path**: `{ "type": "image", "path": "/path/to/image.png", "width": 300, "height": 200 }`
- **Base64 data**: `{ "type": "image", "data": "base64string", "format": "png", "width": 150, "height": 100 }`

**URL Image Features:**
- Automatic download from HTTP/HTTPS URLs
- Fallback to generated placeholder image if download fails
- Placeholder shows original URL and dimensions
- Support for common image formats (PNG, JPEG, JPG)
- Note: Fontconfig warnings on Windows are harmless and can be ignored

Supported formats: PNG, JPEG, JPG

## Notes
- Hyperlinks are rendered visually as underlined blue text. Full hyperlink relationships can be added later.
- Images support URL downloads, local file paths, and base64 data.
- This server runs over stdio to be compatible with MCP hosts.
