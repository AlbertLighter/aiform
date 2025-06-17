import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { string } from 'rollup-plugin-string';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/npm/aiform.js',
      format: 'umd',
      name: 'AIForm',
      sourcemap: true
    },
    {
      file: 'dist/npm/aiform.esm.js',
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      outDir: 'dist/npm',
      declaration: true,
      declarationDir: 'dist/npm'
    }),
    string({
      include: '**/*.css'
    })
  ]
}; 