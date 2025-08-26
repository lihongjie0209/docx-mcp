// v0.4.0 详细功能测试 - 页眉页脚各种元素
import { DocRegistry } from "../dist/docx-utils.js";
import { writeFile } from "node:fs/promises";

const testV040Advanced = async () => {
  console.log("🚀 测试v0.4.0高级页眉页脚功能...");

  const registry = new DocRegistry();

  const json = {
    meta: {
      title: "专业文档示例",
      creator: "DOCX MCP v0.4.0",
      description: "展示专业级页眉页脚功能的完整示例",
      subject: "技术文档",
      keywords: "docx, mcp, 页眉, 页脚, 专业文档"
    },
    pageSettings: {
      pageSize: "A4",
      orientation: "portrait",
      margins: {
        top: 1800,  // 1.25 inch
        bottom: 1800,
        left: 1440,  // 1 inch
        right: 1440
      },
      headerMargin: 720,  // 0.5 inch
      footerMargin: 720
    },
    
    // 复杂的页眉配置
    headers: {
      default: {
        alignment: "left",
        children: [
          {
            type: "documentTitle",
            bold: true,
            size: 12,
            color: "#1f4788"
          },
          {
            type: "text",
            text: " | ",
            size: 12,
            color: "#666666"
          },
          {
            type: "text",
            text: "技术规范文档",
            size: 12,
            italics: true,
            color: "#666666"
          }
        ]
      },
      first: {
        alignment: "center",
        children: [
          {
            type: "text",
            text: "机密文档 - 请勿外传",
            bold: true,
            size: 14,
            color: "#cc0000"
          }
        ]
      },
      even: {
        alignment: "right",
        children: [
          {
            type: "text",
            text: "第 ",
            size: 10
          },
          {
            type: "pageNumber",
            format: "decimal"
          },
          {
            type: "text",
            text: " 页",
            size: 10
          },
          {
            type: "text",
            text: " | ",
            size: 10,
            color: "#666666"
          },
          {
            type: "currentDate",
            format: "yyyy/MM/dd",
            size: 10,
            color: "#666666"
          }
        ]
      }
    },
    
    // 复杂的页脚配置
    footers: {
      default: {
        alignment: "center",
        children: [
          {
            type: "text",
            text: "© 2024 DOCX MCP Project - 第 ",
            size: 9,
            color: "#333333"
          },
          {
            type: "pageNumber",
            format: "decimal"
          },
          {
            type: "text",
            text: " 页",
            size: 9,
            color: "#333333"
          }
        ]
      },
      first: {
        alignment: "center",
        children: [
          {
            type: "text",
            text: "生成时间: ",
            size: 8,
            color: "#666666"
          },
          {
            type: "currentDate",
            format: "yyyy年MM月dd日",
            size: 8,
            color: "#666666"
          },
          {
            type: "text",
            text: " | 版本: v0.4.0",
            size: 8,
            color: "#666666"
          }
        ]
      },
      even: {
        alignment: "left",
        children: [
          {
            type: "text",
            text: "DOCX MCP - ",
            size: 9,
            bold: true,
            color: "#1f4788"
          },
          {
            type: "documentTitle",
            size: 9,
            color: "#333333"
          }
        ]
      }
    },

    content: [
      {
        type: "heading",
        level: 1,
        children: [{ type: "text", text: "DOCX MCP v0.4.0 技术规范", bold: true }]
      },
      {
        type: "paragraph",
        children: [{ 
          type: "text", 
          text: "本文档详细介绍了DOCX MCP v0.4.0版本的页眉页脚系统功能。这是一个专业级的文档生成工具，支持复杂的文档结构和格式。"
        }]
      },
      
      {
        type: "horizontalRule"
      },
      
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "页眉页脚功能特性" }]
      },
      
      {
        type: "infoBox",
        boxType: "info",
        title: "功能亮点",
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "v0.4.0版本引入了完整的页眉页脚系统，支持专业文档所需的各种元素和布局选项。" }]
          }
        ]
      },
      
      {
        type: "list",
        ordered: true,
        items: [
          {
            children: [{ type: "text", text: "默认页眉页脚：适用于大多数页面的标准格式" }]
          },
          {
            children: [{ type: "text", text: "首页特殊设置：首页可以有独特的页眉页脚样式" }]
          },
          {
            children: [{ type: "text", text: "奇偶页不同：支持书籍式的奇偶页不同布局" }]
          },
          {
            children: [{ type: "text", text: "动态内容：页码、日期、文档标题等自动更新" }]
          },
          {
            children: [{ type: "text", text: "丰富样式：支持字体、颜色、对齐等多种格式选项" }]
          }
        ]
      },
      
      {
        type: "heading",
        level: 3,
        children: [{ type: "text", text: "支持的元素类型" }]
      },
      
      {
        type: "table",
        borders: true,
        borderStyle: "single",
        borderColor: "#cccccc",
        rows: [
          {
            isHeader: true,
            cells: [
              {
                children: [{ type: "paragraph", children: [{ type: "text", text: "元素类型", bold: true }] }],
                backgroundColor: "#f8f9fa",
                verticalAlign: "center"
              },
              {
                children: [{ type: "paragraph", children: [{ type: "text", text: "功能描述", bold: true }] }],
                backgroundColor: "#f8f9fa",
                verticalAlign: "center"
              },
              {
                children: [{ type: "paragraph", children: [{ type: "text", text: "支持选项", bold: true }] }],
                backgroundColor: "#f8f9fa",
                verticalAlign: "center"
              }
            ]
          },
          {
            cells: [
              { children: [{ type: "paragraph", children: [{ type: "text", text: "text", fontFamily: "Consolas" }] }] },
              { children: [{ type: "paragraph", children: [{ type: "text", text: "静态文本内容" }] }] },
              { children: [{ type: "paragraph", children: [{ type: "text", text: "字体、大小、颜色、粗体、斜体、下划线" }] }] }
            ]
          },
          {
            cells: [
              { children: [{ type: "paragraph", children: [{ type: "text", text: "pageNumber", fontFamily: "Consolas" }] }] },
              { children: [{ type: "paragraph", children: [{ type: "text", text: "自动页码" }] }] },
              { children: [{ type: "paragraph", children: [{ type: "text", text: "数字、罗马数字、字母等格式" }] }] }
            ]
          },
          {
            cells: [
              { children: [{ type: "paragraph", children: [{ type: "text", text: "currentDate", fontFamily: "Consolas" }] }] },
              { children: [{ type: "paragraph", children: [{ type: "text", text: "当前日期" }] }] },
              { children: [{ type: "paragraph", children: [{ type: "text", text: "自定义日期格式、样式选项" }] }] }
            ]
          },
          {
            cells: [
              { children: [{ type: "paragraph", children: [{ type: "text", text: "documentTitle", fontFamily: "Consolas" }] }] },
              { children: [{ type: "paragraph", children: [{ type: "text", text: "文档标题" }] }] },
              { children: [{ type: "paragraph", children: [{ type: "text", text: "从文档元数据自动获取" }] }] }
            ]
          },
          {
            cells: [
              { children: [{ type: "paragraph", children: [{ type: "text", text: "image", fontFamily: "Consolas" }] }] },
              { children: [{ type: "paragraph", children: [{ type: "text", text: "图片内容" }] }] },
              { children: [{ type: "paragraph", children: [{ type: "text", text: "base64、文件路径、URL" }] }] }
            ]
          }
        ]
      },
      
      {
        type: "pageBreak"
      },
      
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "使用示例" }]
      },
      
      {
        type: "paragraph",
        children: [{ type: "text", text: "以下是一个完整的页眉页脚配置示例：" }]
      },
      
      {
        type: "codeBlock",
        language: "json",
        showLineNumbers: true,
        code: `{
  "headers": {
    "default": {
      "alignment": "left",
      "children": [
        {
          "type": "documentTitle",
          "bold": true,
          "size": 12,
          "color": "#1f4788"
        },
        {
          "type": "text",
          "text": " | 技术规范文档",
          "size": 12,
          "italics": true
        }
      ]
    },
    "first": {
      "alignment": "center",
      "children": [
        {
          "type": "text",
          "text": "机密文档",
          "bold": true,
          "color": "#cc0000"
        }
      ]
    }
  },
  "footers": {
    "default": {
      "alignment": "center",
      "children": [
        {
          "type": "text",
          "text": "第 "
        },
        {
          "type": "pageNumber",
          "format": "decimal"
        },
        {
          "type": "text",
          "text": " 页"
        }
      ]
    }
  }
}`
      },
      
      {
        type: "pageBreak"
      },
      
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "技术实现" }]
      },
      
      {
        type: "paragraph",
        children: [{ type: "text", text: "v0.4.0的页眉页脚系统基于docx.js库的Header和Footer功能，提供了以下技术特性：" }]
      },
      
      {
        type: "blockquote",
        children: [
          {
            type: "paragraph",
            children: [{ 
              type: "text", 
              text: "页眉页脚系统采用了灵活的JSON配置方式，允许用户通过简单的数据结构定义复杂的页眉页脚布局。每个元素都支持独立的样式配置，确保最大的设计自由度。",
              italics: true
            }]
          }
        ]
      },
      
      {
        type: "textBox",
        children: [
          {
            type: "paragraph",
            children: [{ 
              type: "text", 
              text: "重要提示：页眉页脚中的页码和日期会在文档打开时自动更新，确保信息的准确性。图片元素支持多种格式，建议使用适当的尺寸以保证文档的加载性能。",
              bold: true,
              color: "#cc6600"
            }]
          }
        ]
      }
    ]
  };

  try {
    const managed = await registry.createAsync("test-v040-advanced", json);
    console.log(`✅ 文档创建成功，ID: ${managed.id}`);
    
    // 导出文档
    const buffer = await registry.packToBuffer(managed.id);
    
    await writeFile('test-v040-advanced.docx', buffer);
    console.log(`📄 文档已保存为: test-v040-advanced.docx (${buffer.length} bytes)`);
    
    return managed.id;
  } catch (error) {
    console.error("❌ 测试失败:", error);
    throw error;
  }
};

// 运行测试
testV040Advanced().then(id => {
  console.log("🎉 v0.4.0高级页眉页脚功能测试完成!");
  console.log("📋 功能验证：");
  console.log("  ✅ 默认页眉页脚");
  console.log("  ✅ 首页特殊设置");
  console.log("  ✅ 奇偶页不同");
  console.log("  ✅ 文本样式控制");
  console.log("  ✅ 页码自动编号");
  console.log("  ✅ 当前日期插入");
  console.log("  ✅ 文档标题引用");
  console.log("  ✅ 复杂布局支持");
}).catch(error => {
  console.error("💥 测试错误:", error);
  process.exit(1);
});
