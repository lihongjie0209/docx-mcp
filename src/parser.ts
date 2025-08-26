import { DocxJSON } from "./schema.js";
import { promises as fs } from "node:fs";
import JSZip from "jszip";
import { parseStringPromise } from "xml2js";

function textOf(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(textOf).join("");
  return "";
}

export async function parseDocxFileToJson(filePath: string): Promise<DocxJSON> {
  const buf = await fs.readFile(filePath);
  return await parseDocxBufferToJson(buf);
}

export async function parseDocxBufferToJson(buf: Uint8Array): Promise<DocxJSON> {
  const zip = await JSZip.loadAsync(buf as any);

  // Parse core properties
  const coreXml = await zip.file("docProps/core.xml")?.async("string");
  const appXml = await zip.file("docProps/app.xml")?.async("string");
  const meta: DocxJSON["meta"] = {};
  if (coreXml) {
    const core = await parseStringPromise(coreXml);
    const c = core["cp:coreProperties"] || {};
    meta.title = textOf(c["dc:title"]?.[0]);
    meta.subject = textOf(c["dc:subject"]?.[0]);
    meta.creator = textOf(c["dc:creator"]?.[0]);
    meta.description = textOf(c["dc:description"]?.[0]);
    meta.keywords = textOf(c["cp:keywords"]?.[0]);
    meta.lastModifiedBy = textOf(c["cp:lastModifiedBy"]?.[0]);
    meta.category = textOf(c["cp:category"]?.[0]);
    const created = textOf(c["dcterms:created"]?.[0]);
    const modified = textOf(c["dcterms:modified"]?.[0]);
    if (created) meta.createdAt = created;
    if (modified) meta.modifiedAt = modified;
  }
  if (appXml) {
    // company/manager sometimes in app.xml (not always)
    const app = await parseStringPromise(appXml);
    const a = app.Properties || {};
    meta.company = textOf(a.Company?.[0]);
    meta.manager = textOf(a.Manager?.[0]);
  }

  // Parse document.xml to extract paragraphs/tables at a basic level
  const docXml = await zip.file("word/document.xml")?.async("string");
  const content: any[] = [];
  if (docXml) {
    const doc = await parseStringPromise(docXml);
    const body = doc["w:document"]?.["w:body"]?.[0];
    const children: any[] = body ? Object.values(body).flat() as any[] : [];
    // xml2js gives arrays keyed by tags; iterate in original order via a custom approach
    // Fallback: manually scan body._children is not available, so we reconstruct by looking at known sequences
    const seq = [] as any[];
    for (const key of Object.keys(body || {})) {
      const arr = (body as any)[key];
      if (Array.isArray(arr)) {
        for (const item of arr) seq.push({ tag: key, node: item });
      }
    }
    for (const item of seq) {
      if (item.tag === "w:p") {
        const p = item.node;
        const pPr = p["w:pPr"]?.[0];
        let headingLevel: number | undefined;
        const styleVal = pPr?.["w:pStyle"]?.[0]?.["$"]?.["w:val"];
        if (typeof styleVal === "string") {
          const m = /Heading([1-6])/.exec(styleVal);
          if (m) headingLevel = parseInt(m[1], 10);
        }
        const runs = [] as any[];
        for (const r of p["w:r"] || []) {
          const t = textOf(r["w:t"]?.[0]);
          if (t) {
            const rPr = r["w:rPr"]?.[0] || {};
            runs.push({
              type: "text",
              text: t,
              bold: rPr["w:b"] ? true : undefined,
              italics: rPr["w:i"] ? true : undefined,
              underline: rPr["w:u"] ? true : undefined,
            });
          }
        }
        content.push(headingLevel ? { type: "heading", level: headingLevel, children: runs } : { type: "paragraph", children: runs });
      } else if (item.tag === "w:tbl") {
        const tbl = item.node;
        const rows = [] as any[];
        for (const tr of tbl["w:tr"] || []) {
          const cells = [] as any[];
          for (const tc of tr["w:tc"] || []) {
            const paras = [] as any[];
            for (const p of tc["w:p"] || []) {
              const runs = [] as any[];
              for (const r of p["w:r"] || []) {
                const t = textOf(r["w:t"]?.[0]);
                if (t) runs.push({ type: "text", text: t });
              }
              paras.push({ type: "paragraph", children: runs });
            }
            cells.push({ children: paras });
          }
          rows.push({ cells });
        }
        content.push({ type: "table", rows });
      }
    }
  }

  const json: DocxJSON = { meta, content };
  return json;
}
