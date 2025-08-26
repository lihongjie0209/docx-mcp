import { AlignmentType, Document, HeadingLevel, ImageRun, Paragraph, Table, TableCell, TableRow, TextRun, Packer } from "docx";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { DocxSchema, DocxJSON } from "./schema.js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateDocx = ajv.compile(DocxSchema);

export type DocId = string;

export interface ManagedDoc {
  id: DocId;
  json: DocxJSON; // canonical JSON representation
  doc: Document;  // docx Document instance
  createdAt: string;
  updatedAt: string;
}

export class DocRegistry {
  private docs = new Map<DocId, ManagedDoc>();
  private readonly clone = (obj: any) => (globalThis as any).structuredClone ? (globalThis as any).structuredClone(obj) : JSON.parse(JSON.stringify(obj));

  create(id: DocId, json: DocxJSON): ManagedDoc {
    this.assertValid(json);
    const doc = this.jsonToDoc(json);
    const now = new Date().toISOString();
    const managed: ManagedDoc = { id, json, doc, createdAt: now, updatedAt: now };
    this.docs.set(id, managed);
    return managed;
  }

  open(id: DocId, json: DocxJSON): ManagedDoc {
    // open means register from existing JSON (e.g., load from disk by caller)
    return this.create(id, json);
  }

  async createAsync(id: DocId, json: DocxJSON): Promise<ManagedDoc> {
    this.assertValid(json);
    const doc = await this.jsonToDocAsync(json);
    const now = new Date().toISOString();
    const managed: ManagedDoc = { id, json, doc, createdAt: now, updatedAt: now };
    this.docs.set(id, managed);
    return managed;
  }

  get(id: DocId): ManagedDoc | undefined {
    return this.docs.get(id);
  }

  updateJson(id: DocId, updater: (json: DocxJSON) => DocxJSON): ManagedDoc {
    const cur = this.require(id);
    const next = updater(this.clone(cur.json));
    this.assertValid(next);
    cur.json = next;
    // Note: doc rebuild will be async if images with paths are present
    this.rebuildDoc(cur);
    cur.updatedAt = new Date().toISOString();
    return cur;
  }

  private rebuildDoc(managed: ManagedDoc) {
    // For now, keep sync behavior and defer async image loading
    // In a full implementation, this would be async
    try {
      managed.doc = this.jsonToDoc(managed.json);
    } catch (err: any) {
      if (err.message.includes("async handling")) {
        // Handle images with paths by converting to sync placeholders
        const jsonCopy = this.clone(managed.json);
        this.convertImagePathsToPlaceholders(jsonCopy);
        managed.doc = this.jsonToDoc(jsonCopy);
      } else {
        throw err;
      }
    }
  }

  private convertImagePathsToPlaceholders(json: DocxJSON) {
    // Convert image paths/URLs to text placeholders for sync processing
    const processContent = (content: any[]) => {
      for (let i = 0; i < content.length; i++) {
        const block = content[i];
        if (block.type === "image" && (block.path || block.url)) {
          // Replace image block with paragraph containing path/URL info
          const source = block.path ? `File: ${block.path}` : `URL: ${block.url}`;
          content[i] = {
            type: "paragraph",
            children: [{
              type: "text",
              text: `[Image: ${source}]`,
              italics: true
            }]
          };
        }
      }
    };
    processContent(json.content);
  }  async packToBuffer(id: DocId): Promise<Uint8Array> {
    const cur = this.require(id);
    return await Packer.toBuffer(cur.doc);
  }

  queryMeta(id: DocId) {
    const cur = this.require(id);
    return {
      id: cur.id,
      createdAt: cur.createdAt,
      updatedAt: cur.updatedAt,
      meta: cur.json.meta ?? {}
    };
  }

  queryObjects(id: DocId) {
    const cur = this.require(id);
    // Return a simplified view of objects from JSON (paragraphs, tables, images)
    const objects = cur.json.content.map((block, idx) => ({
      index: idx,
      type: block.type,
    }));
    return { count: objects.length, objects };
  }

  editMeta(id: DocId, patch: Partial<DocxJSON["meta"]>) {
    return this.updateJson(id, (json) => ({
      ...json,
      meta: { ...(json.meta ?? {}), ...(patch ?? {}) }
    }));
  }

  editContent(id: DocId, index: number, newBlock: any) {
    return this.updateJson(id, (json) => {
      const arr = [...json.content];
      if (index < 0 || index >= arr.length) throw new Error("index out of range");
      arr[index] = newBlock;
      return { ...json, content: arr } as DocxJSON;
    });
  }

  insertContent(id: DocId, index: number, newBlock: any) {
    return this.updateJson(id, (json) => {
      const arr = [...json.content];
      if (index < 0 || index > arr.length) throw new Error("index out of range");
      arr.splice(index, 0, newBlock);
      return { ...json, content: arr } as DocxJSON;
    });
  }

  removeContent(id: DocId, index: number) {
    return this.updateJson(id, (json) => {
      const arr = [...json.content];
      if (index < 0 || index >= arr.length) throw new Error("index out of range");
      arr.splice(index, 1);
      return { ...json, content: arr } as DocxJSON;
    });
  }

  private require(id: DocId): ManagedDoc {
    const cur = this.docs.get(id);
    if (!cur) throw new Error(`doc not found: ${id}`);
    return cur;
  }

  private assertValid(json: DocxJSON) {
    const valid = validateDocx(json);
    if (!valid) {
      const msg = ajv.errorsText(validateDocx.errors, { separator: " | " });
      throw new Error(`Invalid Docx JSON: ${msg}`);
    }
  }

  private jsonToDoc(json: DocxJSON): Document {
    const children = json.content.map(block => this.blockToDoc(block)).flat();

    const doc = new Document({
      sections: [{ properties: {}, children }],
      creator: json.meta?.creator,
      description: json.meta?.description,
      title: json.meta?.title,
      subject: json.meta?.subject,
      keywords: json.meta?.keywords,
      lastModifiedBy: json.meta?.lastModifiedBy,
    });

    return doc;
  }

  async jsonToDocAsync(json: DocxJSON): Promise<Document> {
    const children = await Promise.all(
      json.content.map(block => this.blockToDocAsync(block))
    );

    const doc = new Document({
      sections: [{ properties: {}, children: children.flat() }],
      creator: json.meta?.creator,
      description: json.meta?.description,
      title: json.meta?.title,
      subject: json.meta?.subject,
      keywords: json.meta?.keywords,
      lastModifiedBy: json.meta?.lastModifiedBy,
    });

    return doc;
  }

  private blockToDoc(block: any): (Paragraph | Table)[] {
    switch (block.type) {
      case "heading":
      case "paragraph":
        return [this.paragraphFrom(block)];
      case "table":
        return [this.tableFrom(block)];
      case "image":
        return [this.imageParagraph(block)];
      default:
        throw new Error(`Unknown block type: ${block.type}`);
    }
  }

  private async blockToDocAsync(block: any): Promise<(Paragraph | Table)[]> {
    switch (block.type) {
      case "heading":
      case "paragraph":
        return [this.paragraphFrom(block)];
      case "table":
        return [this.tableFrom(block)];
      case "image":
        return [await this.imageParagraphAsync(block)];
      default:
        throw new Error(`Unknown block type: ${block.type}`);
    }
  }

  private paragraphFrom(p: any): Paragraph {
    const runs = this.inlineRuns(p.children || []);
    let alignment: any;
    switch (p.alignment) {
      case "center": alignment = AlignmentType.CENTER; break;
      case "right": alignment = AlignmentType.RIGHT; break;
      case "justify": alignment = AlignmentType.JUSTIFIED; break;
      default: alignment = AlignmentType.LEFT; break;
    }
    const options: any = { children: runs, alignment };
    if (p.type === "heading") {
      const level = Math.min(Math.max(1, p.level || 1), 6);
      (options as any).heading = this.headingLevel(level);
    }
    return new Paragraph(options);
  }

  private inlineRuns(inlines: any[], inHyperlink = false): TextRun[] {
    const runs: TextRun[] = [];
    for (const n of inlines) {
      if (!n) continue;
      if (n.type === "text") {
        runs.push(new TextRun({
          text: n.text ?? "",
          bold: n.bold,
          italics: n.italics,
          underline: (n.underline || inHyperlink) ? {} : undefined,
          strike: n.strike,
          color: inHyperlink ? (n.color ?? "0000EE") : n.color,
          size: n.size ? Math.round(n.size) : undefined,
        }));
      } else if (n.type === "hyperlink") {
        runs.push(...this.inlineRuns(n.children || [], true));
      }
    }
    return runs;
  }

  private headingLevel(level: number): any {
    switch (level) {
      case 1: return HeadingLevel.HEADING_1;
      case 2: return HeadingLevel.HEADING_2;
      case 3: return HeadingLevel.HEADING_3;
      case 4: return HeadingLevel.HEADING_4;
      case 5: return HeadingLevel.HEADING_5;
      default: return HeadingLevel.HEADING_6;
    }
  }

  private tableFrom(t: any): Table {
    const rows = (t.rows || []).map((row: any) => new TableRow({
      children: (row.cells || []).map((cell: any) => new TableCell({
        children: (cell.children || []).map((p: any) => this.paragraphFrom(p))
      }))
    }));
    return new Table({ rows, width: { size: Math.round(t.width || 100), type: "pct" as any } });
  }

  private imageParagraph(img: any): Paragraph {
    let data: Buffer;
    let width = img.width || 200;
    let height = img.height || 200;
    
    if (img.data) {
      // Base64 data provided
      data = Buffer.from(img.data, 'base64');
    } else if (img.path) {
      // Local file path provided - we'll handle this async in a wrapper
      throw new Error("Local image paths require async handling - use imageParagraphAsync instead");
    } else if (img.url) {
      // URL provided - we'll handle this async in a wrapper
      throw new Error("Image URLs require async handling - use imageParagraphAsync instead");
    } else {
      throw new Error("Image must have either 'data' (base64), 'path' (local file), or 'url' (remote image)");
    }
    
    const run = new ImageRun({ data, transformation: { width, height } });
    return new Paragraph({ children: [run] });
  }

  async imageParagraphAsync(img: any): Promise<Paragraph> {
    let data: Buffer;
    let width = img.width || 200;
    let height = img.height || 200;
    
    if (img.data) {
      // Base64 data provided
      data = Buffer.from(img.data, 'base64');
    } else if (img.path) {
      // Local file path provided
      try {
        data = await readFile(img.path);
        // Auto-detect format from file extension if not provided
        if (!img.format) {
          const ext = path.extname(img.path).toLowerCase();
          if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
            throw new Error(`Unsupported image format: ${ext}. Use .png, .jpg, or .jpeg`);
          }
        }
      } catch (err: any) {
        console.warn(`Failed to read image file ${img.path}: ${err.message}. Using placeholder.`);
        data = await this.generatePlaceholderImage(width, height, `File: ${path.basename(img.path)}`);
      }
    } else if (img.url) {
      // URL provided - download or create placeholder
      try {
        data = await this.downloadImage(img.url);
      } catch (err: any) {
        console.warn(`Failed to download image from ${img.url}: ${err.message}. Using placeholder.`);
        data = await this.generatePlaceholderImage(width, height, `URL: ${new URL(img.url).hostname}`);
      }
    } else {
      throw new Error("Image must have either 'data' (base64), 'path' (local file), or 'url' (remote image)");
    }
    
    const run = new ImageRun({ data, transformation: { width, height } });
    return new Paragraph({ children: [run] });
  }

  private async downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}. Expected image/*`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private async generatePlaceholderImage(width: number, height: number, text: string): Promise<Buffer> {
    // Create a simple placeholder image using sharp
    const svgPlaceholder = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0" stroke="#ccc" stroke-width="2"/>
        <text x="50%" y="40%" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#666">
          Image Placeholder
        </text>
        <text x="50%" y="60%" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#999">
          ${text}
        </text>
        <text x="50%" y="75%" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#aaa">
          ${width} × ${height}
        </text>
      </svg>
    `;
    
    return await sharp(Buffer.from(svgPlaceholder))
      .png()
      .toBuffer();
  }
}
