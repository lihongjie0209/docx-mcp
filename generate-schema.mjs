import { DocxSchema } from './dist/schema.js';
import { writeFileSync } from 'fs';

// 生成 JSON Schema 文件
const schemaJson = JSON.stringify(DocxSchema, null, 2);
writeFileSync('./src/schema.json', schemaJson);
console.log('Schema generated successfully at src/schema.json');
