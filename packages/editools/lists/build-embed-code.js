const mockData = require('./mock-data.json')
const buildEmbeddedCode = require('@readr-media/react-embed-code-generator').default.buildEmbeddedCode
const webpackAssets = require('@readr-media/react-embed-code-generator').default.loadWebpackAssets()

console.log(buildEmbeddedCode('react-questionnaire', {form: mockData}, webpackAssets))
