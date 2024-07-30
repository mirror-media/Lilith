import { KeystoneContext } from '@keystone-6/core/types'
import envVar from '../environment-variables'

function checkStoryAccessToken({context, item}: {
  context: KeystoneContext
  item: Record<string, unknown>
}){
  if (envVar.accessControlStrategy === 'gql') {
    // Story is not member only,
    // every request could access content field
    if (item?.isMember === false) {
      return true
    }

    // Story is member only.
    // Check request permission.
    const scope = context.req?.headers?.['x-access-token-scope']
    const media = context.req?.headers?.['x-access-token-media']
    const story = context.req?.headers?.['x-access-token-story']

    // get acl from scope
    const acl =
      typeof scope === 'string'
        ? scope.match(/mesh:member-stories:([^\s]*)/i)?.[1]
        : ''

    if (typeof acl !== 'string') {
      return false
    } else if (acl === 'all') {
      // scope contains 'mesh:member-stories:all'
      // the request has the permission to read this field
      return true
    } else {
      // When acl is media, we should check the scope of media and story
      // check mediaId, scope contains '${mediaId1}, ${mediaId2}, ..., ${mediaIdN}'
      const mediaIdArr = 
        typeof media === 'string'
        ? media.split(','): ''
      
      if (mediaIdArr.indexOf(`${item.sourceId}`) > -1) {
        return true
      }

      // check storyId,scope contains '${storyId1},${storyId2},...,${storyIdN}'
      const storyIdArr = 
        typeof story === 'string'
        ? story.split(','): ''

      // check the request has the permission to read this field
      if (storyIdArr.indexOf(`${item.id}`) > -1) {
        return true
      }
    }
    return false
  }

  // the request has permission to read this field
  return true
}

export function checkAccessToken(list_name: string){
  switch(list_name){
    case "story": return checkStoryAccessToken
    default: return checkStoryAccessToken
  }
}