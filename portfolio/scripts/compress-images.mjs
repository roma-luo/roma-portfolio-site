/**
 * compress-images.mjs
 *
 * 将 /public/images/projects/ 下所有 PNG / JPG / JPEG 转换为 WebP，
 * 并自动将 src/ 目录中所有代码引用从旧扩展名改为 .webp。
 *
 * 运行方式（在 portfolio/ 目录下）：
 *   node scripts/compress-images.mjs
 *
 * 策略：
 *   - 渲染图 / 截图 (PNG)  → WebP quality 82，保留原分辨率
 *   - 照片 (JPG/JPEG)      → WebP quality 82，保留原分辨率
 *   - 原始文件保留，备份至  public/images/projects/_originals/
 *   - MP4 视频不处理
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const IMAGES_DIR  = path.join(ROOT, 'public', 'images', 'projects');
const BACKUP_DIR  = path.join(IMAGES_DIR, '_originals');
const SRC_DIR     = path.join(ROOT, 'src');
const WEBP_QUALITY = 82;

// ── 1. 收集需要处理的图片 ──────────────────────────────────────────────────
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.JPG', '.JPEG', '.PNG']);

const files = fs.readdirSync(IMAGES_DIR).filter(f => {
  const ext = path.extname(f);
  return IMAGE_EXTS.has(ext);
});

if (files.length === 0) {
  console.log('没有找到需要处理的图片。');
  process.exit(0);
}

console.log(`\n找到 ${files.length} 张图片，开始处理…\n`);

// ── 2. 创建备份目录 ────────────────────────────────────────────────────────
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// ── 3. 转换每张图片 ────────────────────────────────────────────────────────
let totalBefore = 0;
let totalAfter  = 0;
const renamedMap = []; // { oldRelPath, newRelPath } 用于后续更新代码引用

for (const file of files) {
  const srcPath    = path.join(IMAGES_DIR, file);
  const baseName   = path.basename(file, path.extname(file));
  const newFile    = `${baseName}.webp`;
  const destPath   = path.join(IMAGES_DIR, newFile);
  const backupPath = path.join(BACKUP_DIR, file);

  const sizeBefore = fs.statSync(srcPath).size;
  totalBefore += sizeBefore;

  try {
    // 转换为 WebP
    await sharp(srcPath)
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toFile(destPath);

    const sizeAfter = fs.statSync(destPath).size;
    totalAfter += sizeAfter;

    const saving = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);
    const beforeMB = (sizeBefore / 1024 / 1024).toFixed(2);
    const afterKB  = (sizeAfter  / 1024).toFixed(0);

    console.log(`✓ ${file.padEnd(28)} ${beforeMB.padStart(7)} MB  →  ${afterKB.padStart(6)} KB  (节省 ${saving}%)`);

    // 备份原文件
    fs.copyFileSync(srcPath, backupPath);

    // 只有在成功生成 webp 后才删除原文件
    // （如果 webp 和原文件名不同才删，防止同名覆盖）
    if (path.extname(file).toLowerCase() !== '.webp') {
      fs.unlinkSync(srcPath);
    }

    // 记录路径映射（相对于 /public，以 / 开头，用于代码替换）
    const oldRelPath = `/images/projects/${file}`;
    const newRelPath = `/images/projects/${newFile}`;
    if (oldRelPath !== newRelPath) {
      renamedMap.push({ oldRelPath, newRelPath });
    }

  } catch (err) {
    console.error(`✗ ${file}: ${err.message}`);
  }
}

console.log('\n' + '─'.repeat(65));
console.log(`总计: ${(totalBefore/1024/1024).toFixed(1)} MB → ${(totalAfter/1024/1024).toFixed(1)} MB  (节省 ${((1-totalAfter/totalBefore)*100).toFixed(1)}%)`);

// ── 4. 更新 src/ 中的代码引用 ──────────────────────────────────────────────
if (renamedMap.length === 0) {
  console.log('\n无需更新代码引用。');
  process.exit(0);
}

console.log(`\n正在更新 src/ 中的代码引用（${renamedMap.length} 条）…`);

// 递归收集 src/ 下所有文本文件
function collectTextFiles(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectTextFiles(full));
    } else if (/\.(ts|tsx|js|jsx|json|css|md)$/.test(entry.name)) {
      result.push(full);
    }
  }
  return result;
}

const textFiles = collectTextFiles(SRC_DIR);
let codeFilesChanged = 0;

for (const filePath of textFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const { oldRelPath, newRelPath } of renamedMap) {
    if (content.includes(oldRelPath)) {
      // 替换所有出现位置
      content = content.split(oldRelPath).join(newRelPath);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    const rel = path.relative(ROOT, filePath);
    console.log(`  ✓ 已更新: ${rel}`);
    codeFilesChanged++;
  }
}

// 也更新 page.tsx（在 src/app/ 下，已包含在上面）
// 额外检查 scripts/ 目录下有无引用
const scriptsDir = path.join(ROOT, 'scripts');
if (fs.existsSync(scriptsDir)) {
  for (const f of fs.readdirSync(scriptsDir)) {
    const fp = path.join(scriptsDir, f);
    if (!/\.(js|mjs|ts)$/.test(f)) continue;
    let content = fs.readFileSync(fp, 'utf8');
    let changed = false;
    for (const { oldRelPath, newRelPath } of renamedMap) {
      if (content.includes(oldRelPath)) {
        content = content.split(oldRelPath).join(newRelPath);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(fp, content, 'utf8');
      console.log(`  ✓ 已更新: scripts/${f}`);
      codeFilesChanged++;
    }
  }
}

console.log(`\n共更新了 ${codeFilesChanged} 个源文件中的图片引用。`);
console.log('\n备份文件已保存至: public/images/projects/_originals/');
console.log('全部完成 ✅');
