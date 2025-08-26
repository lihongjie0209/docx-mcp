import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { DocRegistry } from "./docx-utils.js";
import { DocxSchema } from "./schema.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { nanoid } from "nanoid";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseDocxFileToJson } from "./parser.js";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const registry = new DocRegistry();
// Add docx schema to Ajv with an id for $ref use in tool schemas
ajv.addSchema({ ...DocxSchema, $id: "docx:" });

function ok(data: any) {
  return { content: [{ type: "text", text: JSON.stringify(data) }] };
}

function parseArgs<T>(args: unknown, schema: any): T {
  const validate = ajv.compile(schema);
  if (!validate(args)) {
    throw new McpError(ErrorCode.InvalidParams, ajv.errorsText(validate.errors));
  }
  return args as T;
}

const tools = {
  "docx-getSchema": {
    description: "Get the JSON schema for DOCX document structure. IMPORTANT: Always call this first to understand the document format before using other tools.",
    inputSchema: { type: "object", properties: {} }
  },
  "docx-create": {
    description: "Create a new docx from JSON, returns an id. Use docx-getSchema first to understand the required JSON structure. Supports images via 'data' (base64), 'path' (local file), or 'url' (remote image with fallback).",
    inputSchema: {
      type: "object",
      required: ["json"],
      properties: { json: DocxSchema }
    }
  },
  "docx-open": {
  description: "Open a .docx file from disk into memory and return id.",
  inputSchema: { type: "object", required: ["path"], properties: { id: { type: "string" }, path: { type: "string" } } }
  },
  "docx-queryMeta": {
    description: "Get docx metadata by id.",
    inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } }
  },
  "docx-queryObjects": {
    description: "List top-level object info by id.",
    inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } }
  },
  "docx-editMeta": {
    description: "Patch metadata of a docx by id.",
    inputSchema: { type: "object", required: ["id", "patch"], properties: { id: { type: "string" }, patch: DocxSchema.properties.meta } }
  },
  "docx-editContent": {
    description: "Replace a block at index. Use docx-queryObjects first to see available blocks, and docx-getSchema to understand block structure.",
  inputSchema: { type: "object", required: ["id", "index", "block"], properties: { id: { type: "string" }, index: { type: "integer", minimum: 0 }, block: { $ref: "docx:/$defs/Block" } } }
  },
  "docx-insertContent": {
    description: "Insert a block at index. Use docx-queryObjects first to see current structure, and docx-getSchema to understand block structure.",
  inputSchema: { type: "object", required: ["id", "index", "block"], properties: { id: { type: "string" }, index: { type: "integer", minimum: 0 }, block: { $ref: "docx:/$defs/Block" } } }
  },
  "docx-removeContent": {
    description: "Remove a block at index.",
    inputSchema: { type: "object", required: ["id", "index"], properties: { id: { type: "string" }, index: { type: "integer", minimum: 0 } } }
  },
  "docx-save": {
    description: "Persist the docx to disk path by id.",
    inputSchema: { type: "object", required: ["id", "path"], properties: { id: { type: "string" }, path: { type: "string" } } }
  },
  "docx-openFile": {
    description: "Open a .docx file from disk into memory and return id.",
    inputSchema: { type: "object", required: ["path"], properties: { id: { type: "string" }, path: { type: "string" } } }
  },
  "docx-exportJson": {
    description: "Return the current JSON model for a given id.",
    inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } }
  }
} as const;

const server = new Server(
  {
    name: "docx-mcp",
    version: "0.1.0",
    description: "DOCX document operations server. WORKFLOW: 1) Call docx-getSchema first to understand document structure, 2) Use other tools with proper JSON format"
  },
  {
    capabilities: { 
      tools: {},
      instructions: "Always start by calling docx-getSchema to understand the document JSON structure before creating or editing documents."
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: Object.entries(tools).map(([name, t]) => ({ name, description: t.description, inputSchema: t.inputSchema as any }))
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    switch (name) {
      case "docx-getSchema": {
        return ok({
          schema: DocxSchema,
          description: "JSON Schema for DOCX document structure. Use this to understand the format before creating or editing documents.",
          examples: {
            simpleDocument: {
              meta: { title: "Sample Document", creator: "Agent" },
              content: [
                { type: "heading", level: 1, children: [{ type: "text", text: "Title" }] },
                { type: "paragraph", children: [{ type: "text", text: "Hello ", bold: true }, { type: "text", text: "world" }] }
              ]
            },
            withTable: {
              meta: { title: "Document with Table" },
              content: [
                { type: "heading", level: 1, children: [{ type: "text", text: "Data Table" }] },
                { 
                  type: "table", 
                  rows: [
                    { cells: [{ children: [{ type: "paragraph", children: [{ type: "text", text: "Header 1" }] }] }] },
                    { cells: [{ children: [{ type: "paragraph", children: [{ type: "text", text: "Data 1" }] }] }] }
                  ]
                }
              ]
            },
            withImages: {
              meta: { title: "Document with Images" },
              content: [
                { type: "heading", level: 1, children: [{ type: "text", text: "Images Example" }] },
                { type: "paragraph", children: [{ type: "text", text: "Image from URL:" }] },
                { type: "image", url: "https://via.placeholder.com/300x200", width: 300, height: 200 },
                { type: "paragraph", children: [{ type: "text", text: "Image from local file:" }] },
                { type: "image", path: "C:\\path\\to\\image.png", width: 300, height: 200 },
                { type: "paragraph", children: [{ type: "text", text: "Image from base64 data:" }] },
                { type: "image", data: "iVBORw0KGgoAAAANS...", format: "png", width: 150, height: 100 }
              ]
            }
          }
        });
      }
      case "docx-create": {
        const { json } = parseArgs<{ json: any }>(args, tools["docx-create"].inputSchema);
        const id = nanoid();
        
        // Check if JSON contains images with local paths or URLs
        const jsonStr = JSON.stringify(json);
        const hasImagePaths = jsonStr.includes('"path"') || jsonStr.includes('"url"');
        
        if (hasImagePaths) {
          // Use async version for images with local paths or URLs
          const { id: docId } = await registry.createAsync(id, json);
          return ok({ id: docId });
        } else {
          // Use sync version for base64 images or no images
          const { id: docId } = registry.create(id, json);
          return ok({ id: docId });
        }
      }
      case "docx-open": {
        const { id, path: filePath } = parseArgs<{ id?: string; path: string }>(args, tools["docx-open"].inputSchema);
        const json = await parseDocxFileToJson(filePath);
        const docId = id ?? nanoid();
        registry.open(docId, json);
        return ok({ id: docId });
      }
      case "docx-queryMeta": {
        const { id } = parseArgs<{ id: string }>(args, tools["docx-queryMeta"].inputSchema);
        return ok(registry.queryMeta(id));
      }
      case "docx-queryObjects": {
        const { id } = parseArgs<{ id: string }>(args, tools["docx-queryObjects"].inputSchema);
        return ok(registry.queryObjects(id));
      }
      case "docx-editMeta": {
        const { id, patch } = parseArgs<{ id: string; patch: any }>(args, tools["docx-editMeta"].inputSchema);
        const res = registry.editMeta(id, patch);
        return ok({ id: res.id, updatedAt: res.updatedAt, meta: res.json.meta });
      }
      case "docx-editContent": {
        const { id, index, block } = parseArgs<{ id: string; index: number; block: any }>(args, tools["docx-editContent"].inputSchema);
        const res = registry.editContent(id, index, block);
        return ok({ id: res.id, updatedAt: res.updatedAt });
      }
      case "docx-insertContent": {
        const { id, index, block } = parseArgs<{ id: string; index: number; block: any }>(args, tools["docx-insertContent"].inputSchema);
        const res = registry.insertContent(id, index, block);
        return ok({ id: res.id, updatedAt: res.updatedAt });
      }
      case "docx-removeContent": {
        const { id, index } = parseArgs<{ id: string; index: number }>(args, tools["docx-removeContent"].inputSchema);
        const res = registry.removeContent(id, index);
        return ok({ id: res.id, updatedAt: res.updatedAt });
      }
      case "docx-save": {
        const { id, path: outPath } = parseArgs<{ id: string; path: string }>(args, tools["docx-save"].inputSchema);
        const buf = await registry.packToBuffer(id);
  const dir = path.dirname(outPath);
  await mkdir(dir, { recursive: true });
        await writeFile(outPath, buf);
        return ok({ id, path: outPath, bytes: buf.byteLength });
      }
      case "docx-openFile": {
        const { id, path: filePath } = parseArgs<{ id?: string; path: string }>(args, tools["docx-openFile"].inputSchema);
        const json = await parseDocxFileToJson(filePath);
        const docId = id ?? nanoid();
        registry.open(docId, json);
        return ok({ id: docId });
      }
      case "docx-exportJson": {
        const { id } = parseArgs<{ id: string }>(args, tools["docx-exportJson"].inputSchema);
        const doc = registry.get(id);
        if (!doc) throw new McpError(ErrorCode.InvalidParams, `doc not found: ${id}`);
        return ok(doc.json);
      }
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (err: any) {
    throw new McpError(ErrorCode.InternalError, err?.message ?? String(err));
  }
});

// Start stdio transport for MCP
const transport = new StdioServerTransport();
(async () => {
  await server.connect(transport);
})();
