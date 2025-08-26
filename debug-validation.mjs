import { DocRegistry } from './dist/docx-utils.js';
import { DocxSchema } from './dist/schema.js';
import { readFileSync } from 'fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

// 调试 JSON 验证
async function debugValidation() {
  try {
    // 设置验证器
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);
    const validateDocx = ajv.compile(DocxSchema);
    
    // 读取示例文件
    const jsonContent = JSON.parse(readFileSync('./examples/footnotes-example.json', 'utf-8'));
    
    console.log('正在验证 JSON...');
    
    const valid = validateDocx(jsonContent);
    
    if (!valid) {
      console.log('验证失败，错误列表:');
      validateDocx.errors?.forEach((error, index) => {
        console.log(`${index + 1}. ${error.instancePath || '根级别'}: ${error.message}`);
        if (error.params) {
          console.log(`   参数:`, error.params);
        }
        if (error.data !== undefined) {
          console.log(`   数据类型: ${typeof error.data}`);
          if (typeof error.data === 'object' && error.data !== null) {
            console.log(`   对象键: [${Object.keys(error.data).join(', ')}]`);
          }
        }
        console.log(`   Schema路径: ${error.schemaPath}`);
        console.log('');
      });
      
      // 显示JSON的顶级属性
      console.log('JSON 顶级属性:', Object.keys(jsonContent));
      
      // 显示Schema允许的属性
      console.log('Schema 允许的属性:', Object.keys(DocxSchema.properties || {}));
    } else {
      console.log('✓ JSON 验证通过');
    }
    
  } catch (error) {
    console.error('调试失败:', error.message);
  }
}

debugValidation();
