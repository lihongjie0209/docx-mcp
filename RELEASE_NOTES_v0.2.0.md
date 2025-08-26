# Release Notes - v0.2.0 🎉

## 🚀 Major Feature Release

**Release Date:** 2025-01-26  
**NPM:** [@docx-mcp/docx-mcp@0.2.0](https://www.npmjs.com/package/@docx-mcp/docx-mcp)  
**GitHub:** [v0.2.0](https://github.com/lihongjie0209/docx-mcp/releases/tag/v0.2.0)

---

## ✨ New Features

### 📝 Code Blocks with Syntax Highlighting
- Support for **180+ programming languages** via highlight.js
- Automatic syntax highlighting and formatting
- Customizable background colors and fonts
- Perfect for technical documentation

```json
{
  "type": "codeBlock",
  "language": "javascript",
  "code": "const hello = () => console.log('Hello, World!');",
  "backgroundColor": "#f6f8fa"
}
```

### 📋 Advanced List Support
- **Ordered Lists:** Numeric, Roman numerals (I, II, III), letters (A, B, C)
- **Unordered Lists:** Multiple bullet styles
- **Nested Lists:** Multi-level hierarchical structures
- **Smart Formatting:** Automatic indentation and spacing

```json
{
  "type": "list",
  "ordered": true,
  "style": "upperRoman",
  "items": [
    { "text": "First item", "level": 0 },
    { "text": "Nested item", "level": 1 }
  ]
}
```

### 🔄 Page Breaks
- **Page Breaks:** Force content to new page
- **Section Breaks:** Advanced document structure control
- **Document Flow:** Better control over layout

```json
{
  "type": "pageBreak",
  "breakType": "page"
}
```

### 🎨 Enhanced Text Formatting
- **Font Families:** Custom font selection
- **Superscript/Subscript:** Mathematical and chemical notation
- **Text Highlighting:** Background color highlighting
- **Extended Styling:** More comprehensive text control

```json
{
  "type": "text",
  "text": "H₂O",
  "fontFamily": "Times New Roman",
  "subscript": true,
  "highlight": "yellow"
}
```

---

## 🛠 Technical Improvements

### Schema Enhancements
- **Extended Block Types:** CodeBlock, List, PageBreak definitions
- **Enhanced TextRun:** New formatting properties
- **Type Safety:** Comprehensive TypeScript definitions
- **Validation:** Robust JSON schema validation

### Developer Experience
- **Better Documentation:** Comprehensive examples and guides
- **Development Roadmap:** Clear feature planning through v0.6.0
- **Improved Testing:** Enhanced validation and testing framework
- **GitHub Actions:** Robust CI/CD pipeline with tag handling

---

## 📦 Dependencies
- **highlight.js:** Added for syntax highlighting support
- **docx:** Updated to leverage latest features
- **sharp:** Enhanced image processing capabilities

---

## 🔄 Breaking Changes
⚠️ **Schema Extensions:** New block types may require updates to existing JSON documents  
⚠️ **Type Definitions:** Enhanced TypeScript types for better safety

---

## 🧪 Testing
- ✅ All new features tested with comprehensive examples
- ✅ Backward compatibility maintained for existing features
- ✅ Generated test document: `test-new-features.docx` (8,749 bytes)
- ✅ Syntax highlighting verified across multiple languages

---

## 📚 Documentation Updates
- **README.md:** Complete feature overview with examples
- **DEVELOPMENT_PLAN.md:** Roadmap for future versions
- **Schema Documentation:** Detailed API reference

---

## 🔗 Links
- **NPM Package:** https://www.npmjs.com/package/@docx-mcp/docx-mcp
- **GitHub Repository:** https://github.com/lihongjie0209/docx-mcp
- **Documentation:** See README.md for complete usage guide

---

## 🙏 What's Next?

**v0.3.0 Preview:**
- Table of Contents generation
- Custom headers and footers
- Advanced table styling
- Document templates

See `DEVELOPMENT_PLAN.md` for complete roadmap!

---

**Happy Document Creation! 🎉📄**
