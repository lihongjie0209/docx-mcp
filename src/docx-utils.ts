import { 
  AlignmentType, 
  Document, 
  HeadingLevel, 
  ImageRun, 
  Paragraph, 
  Table, 
  TableCell, 
  TableRow, 
  TextRun, 
  Packer,
  PageSize,
  PageOrientation,
  PageMargin,
  SectionType,
  BorderStyle,
  VerticalAlign,
  TableLayoutType,
  WidthType,
  ShadingType,
  Header,
  Footer,
  PageNumber as DocxPageNumber,
  NumberFormat
} from "docx";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { DocxSchema } from "./schema.js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import hljs from "highlight.js";

// 定义 DocxJSON 类型
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
  headers?: {
    default?: any;
    first?: any;
    even?: any;
  };
  footers?: {
    default?: any;
    first?: any;
    even?: any;
  };
  content: any[];
};

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
    const sectionProperties = this.createSectionProperties(json.pageSettings);

    // 创建页眉页脚
    const headers: any = {};
    const footers: any = {};

    if (json.headers?.default) {
      headers.default = this.createHeader(json.headers.default);
    }
    if (json.headers?.first) {
      headers.first = this.createHeader(json.headers.first);
    }
    if (json.headers?.even) {
      headers.even = this.createHeader(json.headers.even);
    }

    if (json.footers?.default) {
      footers.default = this.createFooter(json.footers.default);
    }
    if (json.footers?.first) {
      footers.first = this.createFooter(json.footers.first);
    }
    if (json.footers?.even) {
      footers.even = this.createFooter(json.footers.even);
    }

    const doc = new Document({
      sections: [{ 
        properties: sectionProperties, 
        children,
        headers,
        footers
      }],
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
    const sectionProperties = this.createSectionProperties(json.pageSettings);

    // 创建页眉页脚
    const headers: any = {};
    const footers: any = {};

    if (json.headers?.default) {
      headers.default = this.createHeader(json.headers.default);
    }
    if (json.headers?.first) {
      headers.first = this.createHeader(json.headers.first);
    }
    if (json.headers?.even) {
      headers.even = this.createHeader(json.headers.even);
    }

    if (json.footers?.default) {
      footers.default = this.createFooter(json.footers.default);
    }
    if (json.footers?.first) {
      footers.first = this.createFooter(json.footers.first);
    }
    if (json.footers?.even) {
      footers.even = this.createFooter(json.footers.even);
    }

    const doc = new Document({
      sections: [{ 
        properties: sectionProperties, 
        children: children.flat(),
        headers,
        footers
      }],
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
      case "codeBlock":
        return [this.codeBlockParagraph(block)];
      case "list":
        return this.listToParagraphs(block);
      case "pageBreak":
        return [this.pageBreakParagraph(block)];
      case "horizontalRule":
        return [this.horizontalRuleParagraph(block)];
      case "blockquote":
        return this.blockquoteParagraphs(block);
      case "infoBox":
        return this.infoBoxParagraphs(block);
      case "textBox":
        return this.textBoxParagraphs(block);
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
      case "codeBlock":
        return [this.codeBlockParagraph(block)];
      case "list":
        return this.listToParagraphs(block);
      case "pageBreak":
        return [this.pageBreakParagraph(block)];
      case "horizontalRule":
        return [this.horizontalRuleParagraph(block)];
      case "blockquote":
        return this.blockquoteParagraphs(block);
      case "infoBox":
        return this.infoBoxParagraphs(block);
      case "textBox":
        return this.textBoxParagraphs(block);
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
          font: n.fontFamily,
          superScript: n.superScript,
          subScript: n.subScript,
          smallCaps: n.smallCaps,
          allCaps: n.allCaps,
          characterSpacing: n.spacing,
          highlight: n.highlight
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
    const rows = (t.rows || []).map((row: any, rowIndex: number) => new TableRow({
      children: (row.cells || []).map((cell: any, cellIndex: number) => {
        const cellOptions: any = {
          children: (cell.children || []).map((p: any) => this.paragraphFrom(p))
        };
        
        // 单元格跨越
        if (cell.colSpan && cell.colSpan > 1) {
          cellOptions.columnSpan = cell.colSpan;
        }
        if (cell.rowSpan && cell.rowSpan > 1) {
          cellOptions.rowSpan = cell.rowSpan;
        }
        
        // 背景色
        if (cell.backgroundColor) {
          cellOptions.shading = {
            type: ShadingType.SOLID,
            fill: cell.backgroundColor.replace('#', '')
          };
        }
        
        // 垂直对齐
        if (cell.verticalAlign) {
          const alignMap = {
            top: VerticalAlign.TOP,
            center: VerticalAlign.CENTER,
            bottom: VerticalAlign.BOTTOM
          };
          cellOptions.verticalAlign = alignMap[cell.verticalAlign as keyof typeof alignMap] || VerticalAlign.TOP;
        }
        
        // 单元格边距
        if (cell.margins) {
          cellOptions.margins = {
            top: cell.margins.top || 0,
            bottom: cell.margins.bottom || 0,
            left: cell.margins.left || 108,
            right: cell.margins.right || 108
          };
        }
        
        // 边框设置
        if (cell.borders) {
          cellOptions.borders = {};
          if (cell.borders.top !== undefined) {
            cellOptions.borders.top = cell.borders.top ? { style: BorderStyle.SINGLE, size: 1, color: "000000" } : { style: BorderStyle.NONE };
          }
          if (cell.borders.bottom !== undefined) {
            cellOptions.borders.bottom = cell.borders.bottom ? { style: BorderStyle.SINGLE, size: 1, color: "000000" } : { style: BorderStyle.NONE };
          }
          if (cell.borders.left !== undefined) {
            cellOptions.borders.left = cell.borders.left ? { style: BorderStyle.SINGLE, size: 1, color: "000000" } : { style: BorderStyle.NONE };
          }
          if (cell.borders.right !== undefined) {
            cellOptions.borders.right = cell.borders.right ? { style: BorderStyle.SINGLE, size: 1, color: "000000" } : { style: BorderStyle.NONE };
          }
        }
        
        return new TableCell(cellOptions);
      }),
      // 行属性
      tableHeader: row.isHeader,
      height: row.height ? { value: row.height, rule: "atLeast" } : undefined,
      cantSplit: row.cantSplit
    }));
    
    const tableOptions: any = {
      rows,
      width: { size: Math.round(t.width || 100), type: WidthType.PERCENTAGE }
    };
    
    // 表格对齐
    if (t.alignment) {
      const alignMap = {
        left: AlignmentType.LEFT,
        center: AlignmentType.CENTER,
        right: AlignmentType.RIGHT
      };
      tableOptions.alignment = alignMap[t.alignment as keyof typeof alignMap] || AlignmentType.LEFT;
    }
    
    // 表格边框
    if (t.borders !== false) {
      const borderStyle = t.borderStyle || "single";
      const borderColor = (t.borderColor || "#000000").replace('#', '');
      const borderSize = t.borderSize || 1;
      
      const borderStyleMap = {
        single: BorderStyle.SINGLE,
        double: BorderStyle.DOUBLE,
        thick: BorderStyle.THICK,
        thin: BorderStyle.SINGLE,  // 使用SINGLE代替THIN
        dotted: BorderStyle.DOTTED,
        dashed: BorderStyle.DASHED
      };
      
      const docxBorderStyle = borderStyleMap[borderStyle as keyof typeof borderStyleMap] || BorderStyle.SINGLE;
      
      tableOptions.borders = {
        top: { style: docxBorderStyle, size: borderSize, color: borderColor },
        bottom: { style: docxBorderStyle, size: borderSize, color: borderColor },
        left: { style: docxBorderStyle, size: borderSize, color: borderColor },
        right: { style: docxBorderStyle, size: borderSize, color: borderColor },
        insideHorizontal: { style: docxBorderStyle, size: borderSize, color: borderColor },
        insideVertical: { style: docxBorderStyle, size: borderSize, color: borderColor }
      };
    }
    
    return new Table(tableOptions);
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

  // 新增方法：代码块支持
  private codeBlockParagraph(block: any): Paragraph {
    const { code, language, theme = "default", fontSize = 10, fontFamily = "Consolas" } = block;
    
    // 使用 highlight.js 进行语法高亮
    let highlightedCode = code;
    if (language && hljs.getLanguage(language)) {
      try {
        const result = hljs.highlight(code, { language });
        highlightedCode = result.value;
      } catch (e) {
        // 如果高亮失败，使用原始代码
        console.warn(`Failed to highlight code with language ${language}:`, e);
      }
    }

    // 将高亮的HTML转换为简单的文本格式
    // 这里简化处理，实际应该解析HTML并应用格式
    const plainCode = highlightedCode.replace(/<[^>]*>/g, '');
    
    const runs = plainCode.split('\n').map((line: string, index: number) => {
      const runs = [];
      if (block.showLineNumbers) {
        runs.push(new TextRun({
          text: `${(index + 1).toString().padStart(3, ' ')}  `,
          font: fontFamily,
          size: fontSize * 2,
          color: "666666"
        }));
      }
      runs.push(new TextRun({
        text: line,
        font: fontFamily,
        size: fontSize * 2,
        color: "333333"
      }));
      if (index < plainCode.split('\n').length - 1) {
        runs.push(new TextRun({ break: 1 }));
      }
      return runs;
    }).flat();

    return new Paragraph({
      children: runs,
      spacing: { before: 200, after: 200 },
      shading: {
        type: "solid",
        color: theme === "dark" ? "2d3748" : "f7fafc",
        fill: theme === "dark" ? "2d3748" : "f7fafc"
      }
    });
  }

  // 新增方法：列表支持
  private listToParagraphs(block: any): Paragraph[] {
    const { items, ordered = false, numberFormat = "decimal", bulletStyle = "bullet" } = block;
    
    return items.map((item: any, index: number) => {
      const runs = this.inlineRuns(item.children || []);
      
      // 添加列表标记
      let marker = "";
      if (ordered) {
        switch (numberFormat) {
          case "upperRoman":
            marker = this.toRoman(index + 1).toUpperCase() + ". ";
            break;
          case "lowerRoman":
            marker = this.toRoman(index + 1).toLowerCase() + ". ";
            break;
          case "upperLetter":
            marker = String.fromCharCode(65 + (index % 26)) + ". ";
            break;
          case "lowerLetter":
            marker = String.fromCharCode(97 + (index % 26)) + ". ";
            break;
          default:
            marker = `${index + 1}. `;
        }
      } else {
        switch (bulletStyle) {
          case "circle":
            marker = "○ ";
            break;
          case "square":
            marker = "■ ";
            break;
          case "dash":
            marker = "– ";
            break;
          case "arrow":
            marker = "→ ";
            break;
          default:
            marker = "• ";
        }
      }

      const markerRun = new TextRun({ text: marker });
      const finalRuns = [markerRun, ...runs];

      return new Paragraph({
        children: finalRuns,
        indent: { left: 720 * (item.level || 0) } // 0.5 inch per level
      });
    });
  }

  // 新增方法：分页符支持
  private pageBreakParagraph(block: any): Paragraph {
    const { breakType = "page" } = block;
    
    return new Paragraph({
      children: [new TextRun({ break: breakType === "page" ? 1 : 1 })],
      pageBreakBefore: breakType === "page"
    });
  }

  // 辅助方法：转换为罗马数字
  private toRoman(num: number): string {
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const literals = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    
    let roman = '';
    for (let i = 0; i < values.length; i++) {
      while (num >= values[i]) {
        roman += literals[i];
        num -= values[i];
      }
    }
    return roman;
  }

  // 辅助方法：处理页面设置
  private createSectionProperties(pageSettings?: DocxJSON['pageSettings']) {
    const properties: any = {};

    if (pageSettings) {
      // 页面大小和方向
      if (pageSettings.pageSize || pageSettings.orientation) {
        properties.page = {};
        
        // 设置页面尺寸（使用具体数值，因为PageSize枚举可能不完整）
        if (pageSettings.pageSize) {
          const sizeMap = {
            A4: { width: 11906, height: 16838 },     // 210 x 297 mm
            A3: { width: 16838, height: 23811 },     // 297 x 420 mm  
            A5: { width: 8391, height: 11906 },      // 148 x 210 mm
            Letter: { width: 12240, height: 15840 }, // 8.5 x 11 inch
            Legal: { width: 12240, height: 20160 },  // 8.5 x 14 inch
            Tabloid: { width: 15840, height: 24480 }, // 11 x 17 inch
            Executive: { width: 10440, height: 15120 } // 7.25 x 10.5 inch
          };
          
          const size = sizeMap[pageSettings.pageSize];
          if (size) {
            properties.page.size = {
              width: size.width,
              height: size.height
            };
          }
        }

        // 页面方向
        if (pageSettings.orientation) {
          properties.page.orientation = pageSettings.orientation === "landscape" ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT;
        }
      }

      // 页边距
      if (pageSettings.margins) {
        properties.margin = {
          top: pageSettings.margins.top || 1440,
          bottom: pageSettings.margins.bottom || 1440,
          left: pageSettings.margins.left || 1440,
          right: pageSettings.margins.right || 1440
        };
      }

      // 页眉页脚边距
      if (pageSettings.headerMargin !== undefined || pageSettings.footerMargin !== undefined) {
        properties.headers = properties.headers || {};
        properties.footers = properties.footers || {};
        if (pageSettings.headerMargin !== undefined) {
          properties.titlePage = true;
        }
      }
    }

    return properties;
  }

  // 处理水平分隔线
  private horizontalRuleParagraph(rule: any): Paragraph {
    const style = rule.style || "single";
    const color = rule.color || "#000000";
    const alignment = rule.alignment || "center";
    
    return new Paragraph({
      children: [new TextRun({ text: "───────────────────────────────────────" })],
      alignment: alignment === "center" ? AlignmentType.CENTER : 
                alignment === "right" ? AlignmentType.RIGHT : AlignmentType.LEFT,
      spacing: { before: 240, after: 240 }
    });
  }

  // 处理引用块  
  private blockquoteParagraphs(blockquote: any): (Paragraph | Table)[] {
    const children = blockquote.children || [];
    const leftIndent = blockquote.leftIndent || 720;
    
    const result: (Paragraph | Table)[] = [];
    
    children.forEach((block: any) => {
      // 为每个子块添加引用样式
      const styledBlock = { ...block };
      if (block.type === 'paragraph' || block.type === 'heading') {
        styledBlock.indent = { left: leftIndent };
        styledBlock.border = {
          left: {
            color: blockquote.borderColor || "#cccccc",
            size: 6,
            style: "single"
          }
        };
      }
      
      const blockElements = this.blockToDoc(styledBlock);
      result.push(...blockElements);
    });
    
    return result;
  }

  // 处理信息框
  private infoBoxParagraphs(infoBox: any): (Paragraph | Table)[] {
    const boxType = infoBox.boxType || "info";
    const title = infoBox.title;
    const children = infoBox.children || [];
    
    const result: (Paragraph | Table)[] = [];
    
    // 添加标题段落
    if (title) {
      result.push(new Paragraph({
        children: [new TextRun({ text: title, bold: true })],
        spacing: { before: 240, after: 120 }
      }));
    }
    
    // 添加内容段落
    children.forEach((block: any) => {
      const blockElements = this.blockToDoc(block);
      result.push(...blockElements);
    });
    
    return result;
  }

  // 处理文本框
  private textBoxParagraphs(textBox: any): (Paragraph | Table)[] {
    const children = textBox.children || [];
    const result: (Paragraph | Table)[] = [];
    
    children.forEach((block: any) => {
      // 为文本框内容添加边框样式
      const styledBlock = { ...block };
      if (block.type === 'paragraph' || block.type === 'heading') {
        styledBlock.border = {
          top: { color: "#000000", size: 6, style: "single" },
          bottom: { color: "#000000", size: 6, style: "single" },
          left: { color: "#000000", size: 6, style: "single" },
          right: { color: "#000000", size: 6, style: "single" }
        };
      }
      
      const blockElements = this.blockToDoc(styledBlock);
      result.push(...blockElements);
    });
    
    return result;
  }

  // 创建页眉
  private createHeader(headerContent: any): Header {
    if (!headerContent || !headerContent.children) {
      return new Header({
        children: [new Paragraph({ children: [] })]
      });
    }

    const children = this.createHeaderFooterElements(headerContent.children);
    const alignment = this.getAlignment(headerContent.alignment);

    return new Header({
      children: [
        new Paragraph({
          children,
          alignment
        })
      ]
    });
  }

  // 创建页脚
  private createFooter(footerContent: any): Footer {
    if (!footerContent || !footerContent.children) {
      return new Footer({
        children: [new Paragraph({ children: [] })]
      });
    }

    const children = this.createHeaderFooterElements(footerContent.children);
    const alignment = this.getAlignment(footerContent.alignment);

    return new Footer({
      children: [
        new Paragraph({
          children,
          alignment
        })
      ]
    });
  }

  // 创建页眉页脚元素
  private createHeaderFooterElements(elements: any[]): (TextRun | ImageRun)[] {
    const children: (TextRun | ImageRun)[] = [];

    elements.forEach(element => {
      switch (element.type) {
        case "text":
          children.push(new TextRun({
            text: element.text,
            bold: element.bold,
            italics: element.italics,
            underline: element.underline,
            size: element.size ? element.size * 2 : 24, // Convert to half-points
            color: element.color?.replace('#', '') || "000000",
            font: element.fontFamily || "Arial"
          }));
          break;

        case "pageNumber":
          // 使用正确的页码API
          children.push(new TextRun({
            text: "",
            children: [DocxPageNumber.CURRENT]
          }));
          break;

        case "currentDate":
          const currentDate = new Date();
          const formattedDate = this.formatDate(currentDate, element.format || "MM/dd/yyyy");
          children.push(new TextRun({
            text: formattedDate,
            bold: element.bold,
            italics: element.italics,
            size: element.size ? element.size * 2 : 24,
            color: element.color?.replace('#', '') || "000000"
          }));
          break;

        case "documentTitle":
          // 从文档meta中获取标题
          children.push(new TextRun({
            text: "Document Title", // 这里需要传入实际的文档标题
            bold: element.bold,
            italics: element.italics,
            size: element.size ? element.size * 2 : 24,
            color: element.color?.replace('#', '') || "000000"
          }));
          break;

        case "image":
          // 页眉页脚中的图片处理（需要异步版本）
          if (element.data) {
            try {
              const buffer = Buffer.from(element.data, 'base64');
              children.push(new ImageRun({
                data: buffer,
                transformation: {
                  width: element.width || 50,
                  height: element.height || 50,
                }
              }));
            } catch (error) {
              console.warn("Failed to create header/footer image:", error);
            }
          }
          break;
      }
    });

    return children;
  }

  // 获取对齐方式
  private getAlignment(alignment?: string) {
    switch (alignment) {
      case "center": return AlignmentType.CENTER;
      case "right": return AlignmentType.RIGHT;
      default: return AlignmentType.LEFT;
    }
  }

  // 获取页码格式
  private getPageNumberFormat(format?: string) {
    switch (format) {
      case "upperRoman":
        return NumberFormat.UPPER_ROMAN;
      case "lowerRoman":
        return NumberFormat.LOWER_ROMAN;
      case "upperLetter":
        return NumberFormat.UPPER_LETTER;
      case "lowerLetter":
        return NumberFormat.LOWER_LETTER;
      default:
        return NumberFormat.DECIMAL;
    }
  }

  // 格式化日期
  private formatDate(date: Date, format: string): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return format
      .replace('yyyy', year.toString())
      .replace('MM', month)
      .replace('dd', day)
      .replace('yy', year.toString().slice(-2));
  }
}
