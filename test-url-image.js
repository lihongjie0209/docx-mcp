import { DocRegistry } from './dist/docx-utils.js';
import { nanoid } from 'nanoid';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

async function testUrlImage() {
  const registry = new DocRegistry();
  
  // Test with a working URL
  console.log('Testing with working URL...');
  const workingDoc = {
    content: [
      {
        type: 'heading',
        level: 1,
        children: [{ type: 'text', text: 'URL Image Test' }]
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Image from picsum.photos (300x200):' }]
      },
      {
        type: 'image',
        url: 'https://picsum.photos/300/200',
        width: 300,
        height: 200
      }
    ]
  };
  
  try {
    const docId = nanoid();
    await registry.createAsync(docId, workingDoc);
    const buffer = await registry.packToBuffer(docId);
    await writeFile('test-working-url.docx', buffer);
    console.log(`✅ Successfully created document with working URL image (${buffer.byteLength} bytes)`);
  } catch (error) {
    console.error('❌ Error with working URL:', error.message);
  }
  
  // Test with a failing URL
  console.log('\nTesting with failing URL...');
  const failingDoc = {
    content: [
      {
        type: 'heading',
        level: 1,
        children: [{ type: 'text', text: 'URL Image Test - Placeholder' }]
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Image from invalid URL (should show placeholder):' }]
      },
      {
        type: 'image',
        url: 'https://invalid-url-that-will-fail.com/image.png',
        width: 400,
        height: 300
      }
    ]
  };
  
  try {
    const docId = nanoid();
    await registry.createAsync(docId, failingDoc);
    const buffer = await registry.packToBuffer(docId);
    await writeFile('test-failing-url.docx', buffer);
    console.log(`✅ Successfully created document with placeholder image (${buffer.byteLength} bytes)`);
  } catch (error) {
    console.error('❌ Error with failing URL:', error.message);
  }
}

testUrlImage().catch(console.error);
