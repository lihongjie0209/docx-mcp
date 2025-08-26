# docx-mcp

A Node.js MCP server that lets clients create, query, edit, and save DOCX documents using a JSON schema, powered by the `docx` library.

## Features
- **Complete DOCX operations**: Create, edit, and save Word documents via Model Context Protocol (MCP)
- **JSON Schema validation**: Structured document definition with comprehensive validation
- **Rich content blocks**:
  - **Text & Headings**: 6 heading levels with advanced formatting
  - **Lists**: Ordered/unordered lists with multiple numbering styles and nesting
  - **Code Blocks**: Syntax highlighting for 180+ languages with themes and line numbers
  - **Tables**: Full table support with styling and cell formatting
  - **Images**: URL downloads with fallback, local files, and base64 embedding
  - **Page Control**: Page breaks and section breaks
- **Advanced text formatting**:
  - Basic: Bold, italic, underline, strikethrough, colors
  - Enhanced: Superscript, subscript, font families, highlights, small caps
  - Spacing: Character spacing, paragraph alignment, indentation
- **Document management**: In-memory registry with unique IDs
- **Metadata support**: Complete document properties and custom metadata
- **File operations**: Open existing DOCX files and save to disk
- **Error handling**: Graceful fallbacks and comprehensive validation

## JSON Schema
See `src/schema.ts` for the full schema. Key concepts:
- **meta**: Document metadata (title, subject, creator, etc.)
- **pageSettings**: Page size, orientation, margins, header/footer margins (NEW in v0.3.0)
- **headers**: Page header configuration with default/first/even page support (NEW in v0.4.0)
- **footers**: Page footer configuration with default/first/even page support (NEW in v0.4.0)
- **content**: Array of blocks: heading, paragraph, table, image, codeBlock, list, pageBreak, horizontalRule, blockquote, infoBox, textBox
- **Enhanced blocks**:
  - **CodeBlock**: `{ type: "codeBlock", language: "javascript", code: "...", showLineNumbers: true }`
  - **List**: `{ type: "list", ordered: true, items: [...] }` with nesting support
  - **Table**: Enhanced with backgroundColor, borders, verticalAlign, cell margins (NEW in v0.3.0)
  - **HorizontalRule**: `{ type: "horizontalRule", style: "single", color: "#666" }` (NEW in v0.3.0)
  - **Blockquote**: `{ type: "blockquote", children: [...], borderColor: "#ccc" }` (NEW in v0.3.0)
  - **InfoBox**: `{ type: "infoBox", boxType: "info", title: "Note", children: [...] }` (NEW in v0.3.0)
  - **TextBox**: `{ type: "textBox", children: [...] }` with border styling (NEW in v0.3.0)
  - **Enhanced TextRun**: Supports fontFamily, superScript, subScript, highlight, etc.
- Each paragraph/heading uses inline runs (text, hyperlink) with rich formatting options

### Headers & Footers Configuration (NEW in v0.4.0)
```json
{
  "headers": {
    "default": {
      "alignment": "center",
      "children": [
        {
          "type": "documentTitle",
          "bold": true,
          "size": 14,
          "color": "#1f4788"
        }
      ]
    },
    "first": {
      "alignment": "right",
      "children": [
        {
          "type": "text",
          "text": "Confidential Document",
          "bold": true,
          "color": "#cc0000"
        }
      ]
    }
  },
  "footers": {
    "default": {
      "alignment": "center", 
      "children": [
        {
          "type": "text",
          "text": "Page "
        },
        {
          "type": "pageNumber",
          "format": "decimal"
        },
        {
          "type": "text",
          "text": " of "
        },
        {
          "type": "pageNumber",
          "format": "totalPages"
        }
      ]
    }
  }
}
```

Supported header/footer elements:
- **text**: Static text with styling options
- **pageNumber**: Auto page numbering (decimal, upperRoman, lowerRoman, upperLetter, lowerLetter)
- **currentDate**: Auto-updating date with custom format strings
- **documentTitle**: References document meta.title
- **image**: Images in headers/footers (base64, path, url)

## New in v0.4.0 - Document Structure & Headers/Footers
- ✅ **Headers & Footers System**: Comprehensive page header and footer support
  - Default, first page, and even page headers/footers
  - Rich content: text, page numbers, dates, document title, images
  - Flexible alignment: left, center, right
  - Advanced styling: fonts, colors, sizes, bold/italic
- ✅ **Dynamic Content Elements**:
  - `pageNumber`: Automatic page numbering with multiple formats (decimal, roman, letters)
  - `currentDate`: Auto-updating dates with custom formats
  - `documentTitle`: Reference document metadata
  - `text`: Static text with full styling options
  - `image`: Headers/footers images support
- ✅ **Professional Layout Control**:
  - Different headers/footers for first page vs. rest of document
  - Odd/even page variations for book-style layouts
  - Precise margin control for headers and footers
  - Integration with existing page settings system

## New in v0.3.0 - Styles & Layout
- ✅ **Page Settings**: Page size (A4, Letter, etc.), orientation, margins control
- ✅ **Enhanced Tables**: Background colors, border styles, vertical alignment, table templates
- ✅ **New Block Types**: Horizontal rules, blockquotes, info boxes, text boxes
- ✅ **Advanced Styling**: More comprehensive table and cell formatting options

## Previous Updates
### v0.2.0 - Enhanced Document Operations
- ✅ **Code Blocks**: Syntax highlighting for 180+ programming languages
- ✅ **Lists**: Ordered and unordered lists with multiple styles and nesting
- ✅ **Page Breaks**: Control document pagination
- ✅ **Enhanced Text**: Superscript, subscript, font families, highlights
- ✅ **Improved Schema**: More comprehensive validation and type safety

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
  "meta": { "title": "Demo", "creator": "DOCX MCP v0.2.0" },
  "content": [
    { "type": "heading", "level": 1, "children": [ { "type": "text", "text": "Title" } ] },
    { "type": "paragraph", "children": [ 
      { "type": "text", "text": "Hello ", "bold": true }, 
      { "type": "text", "text": "world", "color": "FF0000" } 
    ]},
    { 
      "type": "codeBlock", 
      "language": "javascript", 
      "showLineNumbers": true,
      "code": "console.log('Hello, World!');" 
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        { "children": [{ "type": "text", "text": "First item" }] },
        { "children": [{ "type": "text", "text": "Second item" }] }
      ]
    },
    { "type": "image", "url": "https://picsum.photos/300/200", "width": 300, "height": 200 },
    { "type": "pageBreak" },
    { "type": "table", "rows": [ { "cells": [ 
      { "children": [ { "type": "paragraph", "children": [ { "type": "text", "text": "A" } ] } ] }, 
      { "children": [ { "type": "paragraph", "children": [ { "type": "text", "text": "B" } ] } ] } 
    ] } ] }
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
