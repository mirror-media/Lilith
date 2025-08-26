/* eslint-disable */
const http2 = require('http2')
const proxy = require('http2-proxy')
const finalhandler = require('finalhandler')

const keystoneServerPort = process.env.KEYSTONE_SERVER_PORT || '3000'
const reverseProxyPort = process.env.REVERSE_PROXY_PORT || '3002'

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
  }, defaultWebHandler)
})

server.listen(reverseProxyPort, () => {
  console.log('server is listening on ' + reverseProxyPort)
});
