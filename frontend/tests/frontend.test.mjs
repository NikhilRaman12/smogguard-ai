import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, '../src');

function collectSourceFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(full));
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
      files.push(full);
    }
  }
  return files;
}

test('No hardcoded localhost backend URLs in frontend/src', () => {
  const files = collectSourceFiles(srcDir);
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    assert.equal(
      content.includes('http://127.0.0.1:8000') || content.includes('http://localhost:8000'),
      false,
      `Hardcoded backend URL found in ${path.relative(srcDir, file)}`
    );
  }
});

test('Accessibility landmarks and ARIA attributes present in core UI', () => {
  const layout = fs.readFileSync(path.join(srcDir, 'components/Layout.jsx'), 'utf8');
  assert.ok(layout.includes('aria-label="Primary Navigation"'));
  assert.ok(layout.includes('<main'));
  assert.ok(layout.includes('<header'));

  const assistant = fs.readFileSync(path.join(srcDir, 'pages/AIAssistant.jsx'), 'utf8');
  assert.ok(assistant.includes('aria-live="polite"'));
  assert.ok(assistant.includes('aria-label="Ask SmogGuard AI Assistant"'));

  const municipal = fs.readFileSync(path.join(srcDir, 'components/MunicipalIntelligence.jsx'), 'utf8');
  assert.ok(municipal.includes('role="tablist"'));
  assert.ok(municipal.includes('role="tab"'));
  assert.ok(municipal.includes('aria-selected'));
});

test('HTML document declares lang="en" and responsive viewport', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
  assert.ok(html.includes('<html lang="en">'));
  assert.ok(html.includes('name="viewport"'));
  assert.ok(html.includes('width=device-width'));
});
