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
        { $ref: "#/$defs/Heading" }
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
        size: { type: "number" }
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
        borders: { type: "boolean" }
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
        }
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
  content: any[];
};
