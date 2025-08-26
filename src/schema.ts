// JSON Schema definition for a simplified Docx document structure
// This schema allows clients to describe a DOCX using JSON, including metadata and content blocks

export const DocxSchema = {
  $id: "https://example.com/schemas/docx-schema.json",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "DocxDocument",
  type: "object",
  additionalProperties: false,
  required: ["content"],
  properties: {
    meta: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        subject: { type: "string" },
        creator: { type: "string" },
        description: { type: "string" },
        keywords: { type: "string" },
        lastModifiedBy: { type: "string" },
        category: { type: "string" },
        company: { type: "string" },
        manager: { type: "string" },
        revision: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        modifiedAt: { type: "string", format: "date-time" }
      }
    },
    styles: {
      type: "object",
      additionalProperties: false,
      properties: {
        defaultFont: { type: "string" },
        defaultFontSize: { type: "number" }
      }
    },
    pageSettings: {
      type: "object",
      additionalProperties: false,
      properties: {
        pageSize: { 
          type: "string",
          enum: ["A4", "A3", "A5", "Letter", "Legal", "Tabloid", "Executive"],
          default: "A4"
        },
        orientation: {
          type: "string",
          enum: ["portrait", "landscape"],
          default: "portrait"
        },
        margins: {
          type: "object",
          additionalProperties: false,
          properties: {
            top: { type: "number", default: 1440 },    // in twips (1 inch = 1440 twips)
            bottom: { type: "number", default: 1440 },
            left: { type: "number", default: 1440 },
            right: { type: "number", default: 1440 }
          }
        },
        headerMargin: { type: "number", default: 720 },  // 0.5 inch
        footerMargin: { type: "number", default: 720 }
      }
    },
    content: {
      type: "array",
      items: { $ref: "#/$defs/Block" }
    }
  },
  $defs: {
    Block: {
      type: "object",
      oneOf: [
        { $ref: "#/$defs/Paragraph" },
        { $ref: "#/$defs/Table" },
        { $ref: "#/$defs/Image" },
        { $ref: "#/$defs/Heading" },
        { $ref: "#/$defs/CodeBlock" },
        { $ref: "#/$defs/List" },
        { $ref: "#/$defs/PageBreak" },
        { $ref: "#/$defs/HorizontalRule" },
        { $ref: "#/$defs/Blockquote" },
        { $ref: "#/$defs/InfoBox" },
        { $ref: "#/$defs/TextBox" }
      ]
    },
    Heading: {
      type: "object",
      additionalProperties: false,
      required: ["type", "level", "children"],
      properties: {
        type: { const: "heading" },
        level: { type: "integer", minimum: 1, maximum: 6 },
        children: { $ref: "#/$defs/Inlines" },
        spacingBefore: { type: "number" },
        spacingAfter: { type: "number" },
        alignment: { enum: ["left", "center", "right", "justify"] }
      }
    },
    Paragraph: {
      type: "object",
      additionalProperties: false,
      required: ["type", "children"],
      properties: {
        type: { const: "paragraph" },
        children: { $ref: "#/$defs/Inlines" },
        alignment: { enum: ["left", "center", "right", "justify"] },
        spacingBefore: { type: "number" },
        spacingAfter: { type: "number" },
        indent: {
          type: "object",
          additionalProperties: false,
          properties: {
            left: { type: "number" },
            right: { type: "number" },
            firstLine: { type: "number" }
          }
        }
      }
    },
    Inlines: {
      type: "array",
      items: { $ref: "#/$defs/Inline" }
    },
    Inline: {
      type: "object",
      oneOf: [
        { $ref: "#/$defs/TextRun" },
        { $ref: "#/$defs/Hyperlink" }
      ]
    },
    TextRun: {
      type: "object",
      additionalProperties: false,
      required: ["type", "text"],
      properties: {
        type: { const: "text" },
        text: { type: "string" },
        bold: { type: "boolean" },
        italics: { type: "boolean" },
        underline: { type: "boolean" },
        strike: { type: "boolean" },
        color: { type: "string" },
        size: { type: "number" },
        fontFamily: { type: "string" },
        superScript: { type: "boolean" },
        subScript: { type: "boolean" },
        highlight: { type: "string" },
        smallCaps: { type: "boolean" },
        allCaps: { type: "boolean" },
        spacing: { type: "number" }
      }
    },
    Hyperlink: {
      type: "object",
      additionalProperties: false,
      required: ["type", "url", "children"],
      properties: {
        type: { const: "hyperlink" },
        url: { type: "string", format: "uri" },
        children: { $ref: "#/$defs/Inlines" }
      }
    },
    Table: {
      type: "object",
      additionalProperties: false,
      required: ["type", "rows"],
      properties: {
        type: { const: "table" },
        rows: {
          type: "array",
          items: { $ref: "#/$defs/TableRow" }
        },
        width: { type: "number" },
        borders: { type: "boolean" },
        borderStyle: {
          type: "string",
          enum: ["single", "double", "thick", "thin", "dotted", "dashed"],
          default: "single"
        },
        borderColor: { type: "string", default: "#000000" },
        borderSize: { type: "number", default: 1 },
        style: {
          type: "string",
          enum: ["none", "table-grid", "table-list", "table-colorful"],
          default: "none"
        },
        alignment: {
          type: "string",
          enum: ["left", "center", "right"],
          default: "left"
        }
      }
    },
    TableRow: {
      type: "object",
      additionalProperties: false,
      required: ["cells"],
      properties: {
        cells: {
          type: "array",
          items: { $ref: "#/$defs/TableCell" }
        },
        isHeader: { type: "boolean", default: false },
        height: { type: "number" },
        cantSplit: { type: "boolean", default: false }
      }
    },
    TableCell: {
      type: "object",
      additionalProperties: false,
      required: ["children"],
      properties: {
        colSpan: { type: "integer", minimum: 1 },
        rowSpan: { type: "integer", minimum: 1 },
        children: {
          type: "array",
          items: { $ref: "#/$defs/Paragraph" }
        },
        backgroundColor: { type: "string" },
        verticalAlign: {
          type: "string",
          enum: ["top", "center", "bottom"],
          default: "top"
        },
        margins: {
          type: "object",
          additionalProperties: false,
          properties: {
            top: { type: "number", default: 0 },
            bottom: { type: "number", default: 0 },
            left: { type: "number", default: 108 },  // 0.075 inch
            right: { type: "number", default: 108 }
          }
        },
        borders: {
          type: "object",
          additionalProperties: false,
          properties: {
            top: { type: "boolean", default: true },
            bottom: { type: "boolean", default: true },
            left: { type: "boolean", default: true },
            right: { type: "boolean", default: true }
          }
        }
      }
    },
    Image: {
      type: "object",
      additionalProperties: false,
      required: ["type"],
      properties: {
        type: { const: "image" },
        data: { type: "string", description: "base64-encoded image data" },
        path: { type: "string", description: "local file path to image" },
        url: { type: "string", description: "URL to download image from" },
        format: { enum: ["png", "jpeg", "jpg"] },
        width: { type: "number" },
        height: { type: "number" }
      },
      oneOf: [
        { required: ["data", "format"] },
        { required: ["path"] },
        { required: ["url"] }
      ]
    },
    CodeBlock: {
      type: "object",
      additionalProperties: false,
      required: ["type", "code"],
      properties: {
        type: { const: "codeBlock" },
        code: { type: "string" },
        language: { type: "string" },
        showLineNumbers: { type: "boolean", default: false },
        theme: { enum: ["default", "dark", "light", "github"], default: "default" },
        fontSize: { type: "number", default: 10 },
        fontFamily: { type: "string", default: "Consolas" },
        title: { type: "string" },
        caption: { type: "string" }
      }
    },
    List: {
      type: "object",
      additionalProperties: false,
      required: ["type", "items"],
      properties: {
        type: { const: "list" },
        ordered: { type: "boolean", default: false },
        level: { type: "integer", minimum: 0, default: 0 },
        items: {
          type: "array",
          items: { $ref: "#/$defs/ListItem" }
        },
        numberFormat: { enum: ["decimal", "upperRoman", "lowerRoman", "upperLetter", "lowerLetter"], default: "decimal" },
        bulletStyle: { enum: ["bullet", "circle", "square", "dash", "arrow"], default: "bullet" },
        startNumber: { type: "integer", minimum: 1, default: 1 }
      }
    },
    ListItem: {
      type: "object",
      additionalProperties: false,
      required: ["children"],
      properties: {
        children: { $ref: "#/$defs/Inlines" },
        level: { type: "integer", minimum: 0, default: 0 },
        subList: { $ref: "#/$defs/List" }
      }
    },
    PageBreak: {
      type: "object",
      additionalProperties: false,
      required: ["type"],
      properties: {
        type: { const: "pageBreak" },
        breakType: { enum: ["page", "section", "column"], default: "page" }
      }
    },
    HorizontalRule: {
      type: "object",
      additionalProperties: false,
      required: ["type"],
      properties: {
        type: { const: "horizontalRule" },
        style: {
          type: "string",
          enum: ["single", "double", "thick", "thin", "dotted", "dashed"],
          default: "single"
        },
        color: { type: "string", default: "#000000" },
        size: { type: "number", default: 1 },
        alignment: {
          type: "string",
          enum: ["left", "center", "right"],
          default: "center"
        },
        width: { type: "number" }  // percentage width, 0-100
      }
    },
    Blockquote: {
      type: "object",
      additionalProperties: false,
      required: ["type", "children"],
      properties: {
        type: { const: "blockquote" },
        children: {
          type: "array",
          items: { $ref: "#/$defs/Block" }
        },
        style: {
          type: "string",
          enum: ["default", "emphasized", "minimal"],
          default: "default"
        },
        borderColor: { type: "string", default: "#cccccc" },
        backgroundColor: { type: "string" },
        leftIndent: { type: "number", default: 720 }  // 0.5 inch
      }
    },
    InfoBox: {
      type: "object",
      additionalProperties: false,
      required: ["type", "boxType", "children"],
      properties: {
        type: { const: "infoBox" },
        boxType: {
          type: "string",
          enum: ["info", "warning", "error", "success", "note"],
          default: "info"
        },
        title: { type: "string" },
        children: {
          type: "array",
          items: { $ref: "#/$defs/Block" }
        },
        icon: { type: "boolean", default: true },
        customColors: {
          type: "object",
          additionalProperties: false,
          properties: {
            backgroundColor: { type: "string" },
            borderColor: { type: "string" },
            textColor: { type: "string" }
          }
        }
      }
    },
    TextBox: {
      type: "object",
      additionalProperties: false,
      required: ["type", "children"],
      properties: {
        type: { const: "textBox" },
        children: {
          type: "array",
          items: { $ref: "#/$defs/Block" }
        },
        width: { type: "number" },
        height: { type: "number" },
        position: {
          type: "object",
          additionalProperties: false,
          properties: {
            x: { type: "number" },
            y: { type: "number" },
            anchor: {
              type: "string",
              enum: ["page", "margin", "paragraph"],
              default: "paragraph"
            }
          }
        },
        borders: {
          type: "object",
          additionalProperties: false,
          properties: {
            style: {
              type: "string",
              enum: ["single", "double", "thick", "thin", "dotted", "dashed", "none"],
              default: "single"
            },
            color: { type: "string", default: "#000000" },
            size: { type: "number", default: 1 }
          }
        },
        fill: {
          type: "object",
          additionalProperties: false,
          properties: {
            color: { type: "string" },
            transparency: { type: "number", minimum: 0, maximum: 100, default: 0 }
          }
        }
      }
    }
  }
} as const;

export type DocxJSON = {
  meta?: {
    title?: string;
    subject?: string;
    creator?: string;
    description?: string;
    keywords?: string;
    lastModifiedBy?: string;
    category?: string;
    company?: string;
    manager?: string;
    revision?: string;
    createdAt?: string;
    modifiedAt?: string;
  };
  styles?: {
    defaultFont?: string;
    defaultFontSize?: number;
  };
  pageSettings?: {
    pageSize?: "A4" | "A3" | "A5" | "Letter" | "Legal" | "Tabloid" | "Executive";
    orientation?: "portrait" | "landscape";
    margins?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
    headerMargin?: number;
    footerMargin?: number;
  };
  content: any[];
};
