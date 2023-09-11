/* eslint-disable */
const http2 = require('http2')
const proxy = require('http2-proxy')
const finalhandler = require('finalhandler')
const Redis = require('ioredis')

function createRedisInstance() {
  return new Redis(process.env.REDIS_SERVER ?? '')
}

async function testRedisConnection() {
  const testKey = 'testKey'
  const testVal = '5'
  try {
    console.log('// create test redis instance //')
    const redisInstance = createRedisInstance()

    console.log('// write testKey to redis //')
    await redisInstance.set(testKey, testVal)

    console.log('// get testKey from redis //')
    const value = await redisInstance.get(testKey)
    console.log(`testVal: ${value}`)
  } catch (err) {
    console.log(err)
  }
}

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

testRedisConnection()