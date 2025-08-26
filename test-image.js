// Test image support
import { DocRegistry } from "./dist/docx-utils.js";

const registry = new DocRegistry();

// Test with local image path
const testJson = {
  meta: { title: "Image Test", creator: "Test" },
  content: [
    { type: "heading", level: 1, children: [{ type: "text", text: "Image Test" }] },
    { type: "paragraph", children: [{ type: "text", text: "Testing local image support:" }] },
    { type: "image", path: "C:\\Windows\\Web\\Wallpaper\\Windows\\img0.jpg", width: 400, height: 300 }
  ]
};

async function test() {
  try {
    console.log("Testing async create with local image...");
    const doc = await registry.createAsync("test-id", testJson);
    console.log("Success! Document created with ID:", doc.id);
    
    const buffer = await registry.packToBuffer("test-id");
    console.log("Document packed to buffer, size:", buffer.byteLength);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
