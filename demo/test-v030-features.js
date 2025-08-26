// 测试v0.3.0新功能 - 直接使用DocRegistry
import { DocRegistry } from "./dist/docx-utils.js";
import { writeFile } from "node:fs/promises";

const testV030Features = async () => {
  console.log("🚀 测试v0.3.0新功能...");

  const registry = new DocRegistry();

  const json = {
    meta: {
      title: "v0.3.0功能测试文档",
      creator: "DOCX MCP v0.3.0", 
      description: "测试页面设置、增强表格、新块类型和样式系统"
    },
    pageSettings: {
      pageSize: "A4",
      orientation: "portrait",
      margins: {
        top: 1440,
        bottom: 1440,
        left: 1800,
        right: 1800
      },
      headerMargin: 720,
      footerMargin: 720
    },
    content: [
      {
        type: "heading",
        level: 1,
        children: [{ type: "text", text: "v0.3.0 新功能演示" }]
      },
      {
        type: "paragraph",
        children: [{ type: "text", text: "本文档演示了v0.3.0版本的新功能，包括页面设置、增强表格、新块类型等。" }]
      },
      
      // 水平分隔线
      {
        type: "horizontalRule",
        style: "single",
        color: "#666666",
        alignment: "center"
      },
      
      // 引用块
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "引用块演示" }]
      },
      {
        type: "blockquote",
        borderColor: "#0066cc",
        leftIndent: 720,
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "这是一个引用块示例。引用块通常用于突出显示重要的文本内容。", italics: true }]
          },
          {
            type: "paragraph",
            children: [{ type: "text", text: "支持多个段落的引用内容。" }]
          }
        ]
      },
      
      // 信息框
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "信息框演示" }]
      },
      {
        type: "infoBox",
        boxType: "info",
        title: "信息提示",
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "这是一个信息类型的提示框，用于显示重要信息。" }]
          }
        ]
      },
      {
        type: "infoBox",
        boxType: "warning", 
        title: "警告信息",
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "这是一个警告类型的提示框，用于显示需要注意的内容。" }]
          }
        ]
      },
      
      // 增强表格
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "增强表格演示" }]
      },
      {
        type: "table",
        borders: true,
        borderStyle: "single",
        borderColor: "#333333",
        borderSize: 2,
        alignment: "center",
        width: 80,
        rows: [
          {
            isHeader: true,
            cells: [
              {
                children: [
                  {
                    type: "paragraph",
                    children: [{ type: "text", text: "功能", bold: true }]
                  }
                ],
                backgroundColor: "#f0f0f0",
                verticalAlign: "center"
              },
              {
                children: [
                  {
                    type: "paragraph",
                    children: [{ type: "text", text: "描述", bold: true }]
                  }
                ],
                backgroundColor: "#f0f0f0",
                verticalAlign: "center"
              },
              {
                children: [
                  {
                    type: "paragraph",
                    children: [{ type: "text", text: "状态", bold: true }]
                  }
                ],
                backgroundColor: "#f0f0f0",
                verticalAlign: "center"
              }
            ]
          },
          {
            cells: [
              {
                children: [
                  {
                    type: "paragraph",
                    children: [{ type: "text", text: "页面设置" }]
                  }
                ]
              },
              {
                children: [
                  {
                    type: "paragraph",
                    children: [{ type: "text", text: "支持页面大小、方向、边距设置" }]
                  }
                ]
              },
              {
                children: [
                  {
                    type: "paragraph",
                    children: [{ type: "text", text: "✅ 完成", color: "#008000" }]
                  }
                ],
                backgroundColor: "#e8f5e8"
              }
            ]
          },
          {
            cells: [
              {
                children: [
                  {
                    type: "paragraph",
                    children: [{ type: "text", text: "表格增强" }]
                  }
                ]
              },
              {
                children: [
                  {
                    type: "paragraph",
                    children: [{ type: "text", text: "背景色、边框样式、垂直对齐" }]
                  }
                ]
              },
              {
                children: [
                  {
                    type: "paragraph",
                    children: [{ type: "text", text: "✅ 完成", color: "#008000" }]
                  }
                ],
                backgroundColor: "#e8f5e8"
              }
            ]
          },
          {
            cells: [
              {
                children: [
                  {
                    type: "paragraph",
                    children: [{ type: "text", text: "新块类型" }]
                  }
                ]
              },
              {
                children: [
                  {
                    type: "paragraph",
                    children: [{ type: "text", text: "水平线、引用块、信息框、文本框" }]
                  }
                ]
              },
              {
                children: [
                  {
                    type: "paragraph",
                    children: [{ type: "text", text: "✅ 完成", color: "#008000" }]
                  }
                ],
                backgroundColor: "#e8f5e8"
              }
            ]
          }
        ]
      },
      
      // 文本框
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "文本框演示" }]
      },
      {
        type: "textBox",
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "这是一个文本框示例。文本框有边框包围，可以用于突出显示特定内容。", bold: true }]
          },
          {
            type: "paragraph",
            children: [{ type: "text", text: "文本框支持多种样式选项和内容类型。" }]
          }
        ]
      }
    ]
  };

  try {
    const managed = await registry.createAsync("test-v030", json);
    console.log(`✅ 文档创建成功，ID: ${managed.id}`);
    
    // 导出文档
    const buffer = await registry.packToBuffer(managed.id);
    
    await writeFile('test-v030-features.docx', buffer);
    console.log(`📄 文档已保存为: test-v030-features.docx (${buffer.length} bytes)`);
    
    return managed.id;
  } catch (error) {
    console.error("❌ 测试失败:", error);
    throw error;
  }
};

// 运行测试
testV030Features().then(id => {
  console.log("🎉 v0.3.0功能测试完成!");
}).catch(error => {
  console.error("💥 测试错误:", error);
  process.exit(1);
});
