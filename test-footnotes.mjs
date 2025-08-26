import { DocRegistry } from './dist/docx-utils.js';
import { readFileSync, writeFileSync } from 'fs';
import { nanoid } from 'nanoid';

// 测试脚注功能
async function testFootnotes() {
  try {
    const registry = new DocRegistry();
    
    // 读取脚注示例
    const jsonContent = JSON.parse(readFileSync('./examples/complete-footnotes-test.json', 'utf-8'));
    
    console.log('正在处理完整脚注测试文档...');
    
    // 创建文档
    const id = nanoid();
    const doc = await registry.createAsync(id, jsonContent);
    
    // 导出为 buffer
    const buffer = await registry.packToBuffer(doc.id);
    
    // 保存文档
    writeFileSync('./examples/complete-footnotes-test.docx', buffer);
    
    console.log('完整脚注测试文档已成功生成: examples/complete-footnotes-test.docx');
    console.log(`文档大小: ${buffer.byteLength} 字节`);
    
  } catch (error) {
    console.error('测试失败:', error.message);
    console.error(error.stack);
  }
}

testFootnotes();
