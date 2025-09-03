#!/usr/bin/env node
// Simple build script for Vercel deployment

const fs = require('fs');
const path = require('path');

console.log('Building GIE Certificate System for Vercel...');

// Create dist directory
const distDir = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy public files to dist
const publicDir = path.join(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  const copyRecursively = (src, dest) => {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      const files = fs.readdirSync(src);
      files.forEach(file => {
        copyRecursively(path.join(src, file), path.join(dest, file));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  };
  
  copyRecursively(publicDir, distDir);
  console.log('Copied public files to dist directory');
} else {
  console.log('Public directory not found, creating empty dist');
}

console.log('Build completed successfully!');