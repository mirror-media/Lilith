# [@mirrormedia/lilith-core](https://www.npmjs.com/package/@mirrormedia/lilith-core) &middot; ![npm version](https://img.shields.io/npm/v/@mirrormedia/lilith-core.svg?style=flat)

### Installation
`yarn install`

### Build
`yarn build`

### Publish
`npm run publish`

### Notable Details
#### For those files under `views/` folder, we transpile them specifically.
For those files under `views/` folder, we transpile them by babel according to different configuation.
The specific babel configuration is `.views.babelrc.js`.
In `.views.babelrc.js`, we tell babel not to transpile `import` and `export` es6 codes into commonJS codes.
The Keystone server won't start server well if those files under `views/` are transpiled into commonJS codes.
