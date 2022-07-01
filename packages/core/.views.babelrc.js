const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        debug: true,
        modules: false,
        targets: {
          node: '14',
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
