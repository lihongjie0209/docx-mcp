// 测试v0.4.0页眉页脚功能
import { DocRegistry } from "../dist/docx-utils.js";
import { writeFile } from "node:fs/promises";

const testV040HeadersFooters = async () => {
  console.log("🚀 测试v0.4.0页眉页脚功能...");

  const registry = new DocRegistry();

  const json = {
    meta: {
      title: "v0.4.0页眉页脚测试文档",
      creator: "DOCX MCP v0.4.0", 
      description: "测试页眉页脚系统的各种功能"
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
    
    // 页眉设置
    headers: {
      default: {
        alignment: "center",
        children: [
          {
            type: "text",
            text: "文档标题 - v0.4.0功能测试",
            bold: true,
            size: 14,
            color: "#003366"
          }
        ]
      },
      first: {
        alignment: "right",
        children: [
          {
            type: "text",
            text: "首页页眉",
            italics: true,
            size: 12
          }
        ]
      },
      even: {
        alignment: "left",
        children: [
          {
            type: "text",
            text: "偶数页页眉",
            size: 12
          }
        ]
      }
    },
    
    // 页脚设置
    footers: {
      default: {
        alignment: "center",
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
          }
        ]
      },
      first: {
        alignment: "center",
        children: [
          {
            type: "currentDate",
            format: "yyyy年MM月dd日",
            size: 10,
            italics: true
          }
        ]
      },
      even: {
        alignment: "left",
        children: [
          {
            type: "text",
            text: "偶数页页脚 - 第 ",
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
          }
        ]
      }
    },

    content: [
      {
        type: "heading",
        level: 1,
        children: [{ type: "text", text: "v0.4.0 页眉页脚功能演示" }]
      },
      {
        type: "paragraph",
        children: [{ type: "text", text: "本文档演示了v0.4.0版本的页眉页脚功能，包括默认页眉页脚、首页特殊设置、奇偶页不同设置等。" }]
      },
      
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "页眉功能" }]
      },
      {
        type: "paragraph",
        children: [{ type: "text", text: "• 默认页眉：居中显示文档标题，加粗蓝色文字" }]
      },
      {
        type: "paragraph",
        children: [{ type: "text", text: "• 首页页眉：右对齐显示\"首页页眉\"，斜体" }]
      },
      {
        type: "paragraph",
        children: [{ type: "text", text: "• 偶数页页眉：左对齐显示\"偶数页页眉\"" }]
      },
      
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "页脚功能" }]
      },
      {
        type: "paragraph",
        children: [{ type: "text", text: "• 默认页脚：居中显示页码（第 X 页）" }]
      },
      {
        type: "paragraph",
        children: [{ type: "text", text: "• 首页页脚：居中显示当前日期，斜体" }]
      },
      {
        type: "paragraph",
        children: [{ type: "text", text: "• 偶数页页脚：左对齐显示页码信息" }]
      },
      
      {
        type: "pageBreak"
      },
      
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "第二页内容" }]
      },
      {
        type: "paragraph",
        children: [{ type: "text", text: "这是第二页的内容。您可以看到页眉和页脚的变化。如果这是偶数页，页眉页脚将显示为偶数页样式。" }]
      },
      
      {
        type: "paragraph",
        children: [{ type: "text", text: "页眉页脚功能支持以下元素类型：" }]
      },
      
      {
        type: "list",
        ordered: false,
        items: [
          {
            children: [{ type: "text", text: "文本内容：支持样式设置（粗体、斜体、下划线、字体大小、颜色等）" }]
          },
          {
            children: [{ type: "text", text: "页码：支持多种格式（数字、大写罗马、小写罗马、大写字母、小写字母）" }]
          },
          {
            children: [{ type: "text", text: "当前日期：支持自定义日期格式" }]
          },
          {
            children: [{ type: "text", text: "文档标题：自动从文档元数据中获取" }]
          },
          {
            children: [{ type: "text", text: "图片：支持base64、本地文件路径、URL等方式" }]
          }
        ]
      },
      
      {
        type: "pageBreak"
      },
      
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "第三页内容" }]
      },
      {
        type: "paragraph",
        children: [{ type: "text", text: "这是第三页的内容，继续演示页眉页脚功能。在专业文档中，页眉页脚对于文档的整体外观和信息展示非常重要。" }]
      },
      
      {
        type: "paragraph",
        children: [{ type: "text", text: "v0.4.0版本的页眉页脚系统具有以下特点：" }]
      },
      
      {
        type: "table",
        borders: true,
        rows: [
          {
            isHeader: true,
            cells: [
              {
                children: [{ type: "paragraph", children: [{ type: "text", text: "功能", bold: true }] }],
                backgroundColor: "#f0f0f0"
              },
              {
                children: [{ type: "paragraph", children: [{ type: "text", text: "描述", bold: true }] }],
                backgroundColor: "#f0f0f0"
              }
            ]
          },
          {
            cells: [
              { children: [{ type: "paragraph", children: [{ type: "text", text: "默认页眉页脚" }] }] },
              { children: [{ type: "paragraph", children: [{ type: "text", text: "应用于所有页面的标准页眉页脚" }] }] }
            ]
          },
          {
            cells: [
              { children: [{ type: "paragraph", children: [{ type: "text", text: "首页特殊设置" }] }] },
              { children: [{ type: "paragraph", children: [{ type: "text", text: "首页可以有独特的页眉页脚样式" }] }] }
            ]
          },
          {
            cells: [
              { children: [{ type: "paragraph", children: [{ type: "text", text: "奇偶页不同" }] }] },
              { children: [{ type: "paragraph", children: [{ type: "text", text: "奇数页和偶数页可以有不同的页眉页脚" }] }] }
            ]
          },
          {
            cells: [
              { children: [{ type: "paragraph", children: [{ type: "text", text: "动态内容" }] }] },
              { children: [{ type: "paragraph", children: [{ type: "text", text: "页码、日期等自动更新的内容" }] }] }
            ]
          }
        ]
      }
    ]
  };

  try {
    const managed = await registry.createAsync("test-v040-headers-footers", json);
    console.log(`✅ 文档创建成功，ID: ${managed.id}`);
    
    // 导出文档
    const buffer = await registry.packToBuffer(managed.id);
    
    await writeFile('test-v040-headers-footers.docx', buffer);
    console.log(`📄 文档已保存为: test-v040-headers-footers.docx (${buffer.length} bytes)`);
    
    return managed.id;
  } catch (error) {
    console.error("❌ 测试失败:", error);
    throw error;
  }
};

// 运行测试
testV040HeadersFooters().then(id => {
  console.log("🎉 v0.4.0页眉页脚功能测试完成!");
}).catch(error => {
  console.error("💥 测试错误:", error);
  process.exit(1);
});
