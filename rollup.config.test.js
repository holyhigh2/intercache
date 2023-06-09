/* eslint-disable max-len */
const banner2 = require('rollup-plugin-banner2')
const copy = require('rollup-plugin-copy')
const json = require('@rollup/plugin-json')
const typescript = require('rollup-plugin-typescript2')
const pkg = require('./package.json')
const nodeResolve = require('@rollup/plugin-node-resolve')

export default [
  {
    input: './src/index.ts',
    plugins: [
      typescript({
      }),
      nodeResolve(),
      banner2(
        () => `/**
   * ${pkg.name} v${pkg.version}
   * ${pkg.description}
   * @${pkg.author}
   * ${pkg.repository.url}
   */
  `
      ),
      json(),
      copy({
        targets: [
          {
            src: [
              'CHANGELOG.md',
              'LICENSE',
              'README.md',
              'README_ZH.md',
              'package.json',
              '.npmignore',
            ],
            dest: 'dist',
          },
        ],
      }),
    ],
    output: [
      {file: 'test/index.js', format: 'umd',name:'intercache'},
    ],
  }
]