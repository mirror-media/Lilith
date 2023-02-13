import React from 'react'
import styled from 'styled-components'
import { DraftEntityInstance } from 'draft-js'

const RelatedPostRenderWrapper = styled.div`
  display: flex;
  width: 100%;
`

const RelatedPostItem = styled.div`
  flex: 0 0 33.3333%;
  border: 1px solid rgba(0, 0, 0, 0.05);
`

const RelatedPostImage = styled.img`
  display: block;
  width: 100%;
  aspect-ratio: 2;
  object-fit: cover;
`

const RelatedPostTitle = styled.p`
  margin: 0;
  padding: 12px;
`

export function RelatedPostBlock(entity: DraftEntityInstance) {
  const { posts } = entity.getData()

  return (
    <React.Fragment>
      <RelatedPostRenderWrapper>
        {posts.map((post) => (
          <RelatedPostItem key={post.id}>
            <RelatedPostImage
              src={post.heroImage?.resized?.original}
              onError={(e) =>
                (e.currentTarget.src = post.heroImage?.imageFile?.url)
              }
            />
            <RelatedPostTitle>{post.title}</RelatedPostTitle>
          </RelatedPostItem>
        ))}
      </RelatedPostRenderWrapper>
    </React.Fragment>
  )
}
