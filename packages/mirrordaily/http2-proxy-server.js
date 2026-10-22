/* eslint-disable */
const http = require('http')
const http2 = require('http2')
const proxy = require('http2-proxy')
const finalhandler = require('finalhandler')
const keystoneServerPort = process.env.KEYSTONE_SERVER_PORT || '3000'
const reverseProxyPort = process.env.REVERSE_PROXY_PORT || '3002'

// Node 19+ http.globalAgent has a 5s socket timeout, which makes http2-proxy
// answer 504 for any upstream response slower than 5s (e.g. preview SSR).
// Use a dedicated agent without that timeout (the Node 18 behaviour).
const upstreamAgent = new http.Agent()

const defaultWebHandler = (err, req, res) => {
  if (err) {
    console.error('proxy error', err)
    finalhandler(req, res)(err)
  }
}

const server = http2.createServer({ allowHTTP1: true })

server.on('request', (req, res) => {
  proxy.web(req, res, {
    hostname: 'localhost',
    port: keystoneServerPort,
    onReq: (req, options) => http.request({ ...options, agent: upstreamAgent }),
  }, defaultWebHandler)
})

server.listen(reverseProxyPort, () => {
  console.log('server is listening on ' + reverseProxyPort)
});