/* global process, module */
const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  babelrcRoots: [',', 'packages/*'],
  presets: [
    [
      '@babel/env',
      {
        modules: 'auto',
        targets: {
          node: '16',
        },
      },
    ],
    [
      '@babel/preset-react',
      {
        development: !isProduction,
      },
    ],
    '@babel/preset-typescript',
  ],
}
