//see docs: https://babeljs.io/docs/config-files
//we use babelrc.js rather than .babelrc for our babel setting

const pkg = require('./package.json')
const pkgName = pkg.name
const pkgVersion = pkg.version

module.exports = function(api) {
  api.cache(true)
  const plugins = [
    [
      'file-loader',
      {
        name: '[hash].[ext]',
        extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg'],
        outputPath: '/lib/public',
        publicPath: `https://unpkg.com/${pkgName}@${pkgVersion}/lib/public`,
        context: '/src',
        limit: 0,
      },
    ],
    [
      'inline-react-svg',
      {
        svgo: {
          plugins: [
            {
              name: 'removeAttrs',
              params: { attrs: '(data-name)' },
            },
            'cleanupIDs',
          ],
        },
      },
    ],
  ]
  return {
    plugins,
  }
}
