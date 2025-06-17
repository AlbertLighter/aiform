import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import { string } from 'rollup-plugin-string';

export default [
  // Content Script
  {
    input: 'src/extension/content.ts',
    output: {
      file: 'dist/extension/content.js',
      format: 'iife',
      sourcemap: false
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        outDir: 'dist/extension'
      }),
      string({
        include: '**/*.css'
      })
    ]
  },
  // Background Script
  {
    input: 'src/extension/background.ts',
    output: {
      file: 'dist/extension/background.js',
      format: 'iife',
      sourcemap: false
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        outDir: 'dist/extension'
      })
    ]
  },
  // Popup Script
  {
    input: 'src/extension/popup.ts',
    output: {
      file: 'dist/extension/popup.js',
      format: 'iife',
      sourcemap: false
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        outDir: 'dist/extension'
      }),
      // 复制插件相关文件
      copy({
        targets: [
          { src: 'src/extension/manifest.json', dest: 'dist/extension' },
          { src: 'src/extension/popup.html', dest: 'dist/extension' },
          { src: 'src/extension/icons', dest: 'dist/extension' }
        ]
      }),
      string({
        include: '**/*.css'
      })
    ]
  }
]; 