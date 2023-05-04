import React from 'react'
import styled from 'styled-components'
import { DraftEntityInstance } from 'draft-js'

const RelatedPostWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 2px solid #04295e;
  border-width: 2px 2px 2px 12px;
  padding: 16px;
  ${({ theme }) => theme.breakpoint.md} {
    padding: 24px;
  }
`

const RelatedPostTitle = styled.p`
  color: #04295e;
  font-size: 14px;
  line-height: 20px;
  margin: 0 0 -8px;
  ${({ theme }) => theme.breakpoint.md} {
    font-size: 16px;
    line-height: 23px;
  }
`

const RelatedPostItem = styled.div`
  display: flex;
`
const RelatedPostAnchorWrapper = styled.a`
  display: flex;
  text-decoration: none;
`

const RelatedPost = styled.span`
  color: rgba(0, 9, 40, 0.87);
  font-size: 18px;
  line-height: 1.6;
  margin: 12px 0 0;
  border-bottom: 2px solid #ebf02c;
`

export function RelatedPostBlock(entity: DraftEntityInstance) {
  const { posts } = entity.getData()

  return (
    <React.Fragment>
      <RelatedPostWrapper>
        <RelatedPostTitle>推薦閱讀</RelatedPostTitle>
        {posts.map((post) => (
          <RelatedPostItem key={post.id}>
            <RelatedPostAnchorWrapper href={`/post/${post.id}`} target="_blank">
              <RelatedPost>{post.name}</RelatedPost>
            </RelatedPostAnchorWrapper>
          </RelatedPostItem>
        ))}
      </RelatedPostWrapper>
    </React.Fragment>
  )
}
