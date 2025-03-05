import React, { Fragment, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { gql, useLazyQuery } from '@keystone-6/core/admin-ui/apollo'
import { ImageEntity } from './image-selector'
import { SearchBox, SearchBoxOnChangeFn } from './search-box'
import { Pagination } from './pagination'

const postsQuery = gql`
  query Posts($searchText: String!, $take: Int, $skip: Int) {
    postsCount(where: { name: { contains: $searchText } })
    posts(
      where: { name: { contains: $searchText } }
      take: $take
      skip: $skip
    ) {
      id
      name
      type
      heroImage {
        id
        name
        imageFile {
          url
        }
        resized {
          original
        }
      }
      ogImage {
        id
        name
        imageFile {
          url
        }
        resized {
          original
        }
      }
    }
  }
`

const PostSearchBox = styled(SearchBox)`
  margin-top: 10px;
`

const PostSelectionWrapper = styled.div`
  overflow: auto;
  margin-top: 10px;
`

const PostGridsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
`

const PostGridWrapper = styled.div`
  flex: 0 0 33.3333%;
  cursor: pointer;
  padding: 0 10px 10px;
`

const PostMetaGridsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
`

const PostMetaGridWrapper = styled.div`
  flex: 0 0 33.3333%;
  cursor: pointer;
  padding: 0 10px 10px;
`

const Post = styled.div`
  width: 100%;
`

const SeparationLine = styled.div`
  border: #e1e5e9 1px solid;
  margin-top: 10px;
  margin-bottom: 10px;
`

const ErrorHint = styled.span`
  color: red;
`

const PostSelected = styled.div`
  height: 1.4rem;
`

const PostImage = styled.img`
  display: block;
  width: 100%;
  aspect-ratio: 2;
  object-fit: cover;
`

const PostTitle = styled.div`
  padding: 0 5px;
`

const ErrorWrapper = styled.div`
  & * {
    margin: 0;
  }
`

type ID = string

export type PostEntity = {
  id: ID
  slug: string
  name: string
  type: string
  heroImage: ImageEntity
  ogImage: ImageEntity
}

export type PostEntityWithMeta<T> = {
  post: T
}

type PostEntityOnSelectFn<T> = (param: T) => void

function PostGrids<T>(props: {
  posts: T[]
  selected: T[]
  onSelect: PostEntityOnSelectFn<T>
}): React.ReactElement {
  const { posts, selected, onSelect } = props

  return (
    <PostGridsWrapper>
      {(posts as PostEntity[]).map((post) => {
        return (
          <PostGrid
            key={post.id}
            isSelected={selected?.includes(post as T)}
            onSelect={() => onSelect(post as T)}
            post={post}
          />
        )
      })}
    </PostGridsWrapper>
  )
}

function PostGrid<T>(props: {
  post: T
  isSelected: boolean
  onSelect: PostEntityOnSelectFn<T>
}) {
  const { post, onSelect, isSelected } = props
  const newPost = post as PostEntity

  return (
    <PostGridWrapper key={newPost?.id} onClick={() => onSelect(post)}>
      <PostSelected>
        {isSelected ? <i className="fas fa-check-circle"></i> : null}
      </PostSelected>
      <Post>
        <PostImage
          src={newPost.heroImage?.resized?.original}
          onError={(e) =>
            (e.currentTarget.src = newPost.heroImage?.imageFile?.url)
          }
        />
        <PostTitle>{newPost.name}</PostTitle>
      </Post>
    </PostGridWrapper>
  )
}

function PostMetaGrids<T>(props: { postMetas: PostEntityWithMeta<T>[] }) {
  const { postMetas } = props
  return (
    <PostMetaGridsWrapper>
      {postMetas.map((postMetas) => (
        <PostMetaGrid
          key={(postMetas?.post as PostEntity)?.id}
          postMeta={postMetas}
        />
      ))}
    </PostMetaGridsWrapper>
  )
}

function PostMetaGrid<T>(props: {
  postMeta: PostEntityWithMeta<T>
}): React.ReactElement {
  const { postMeta } = props
  const { post } = postMeta
  const newPost = post as PostEntity

  return (
    <PostMetaGridWrapper>
      <Post>
        <PostImage
          src={newPost?.heroImage?.resized?.original}
          onError={(e) =>
            (e.currentTarget.src = newPost?.heroImage?.imageFile?.url)
          }
        />
        <PostTitle>{newPost?.name}</PostTitle>
      </Post>
    </PostMetaGridWrapper>
  )
}

type PostSelectorOnChangeFn<T> = (params: PostEntityWithMeta<T>[]) => void

export function PostSelector<T>(props: {
  onChange: PostSelectorOnChangeFn<T>
  enableMultiSelect?: boolean
  minSelectCount?: number
  maxSelectCount?: number
}) {
  const [
    queryPosts,
    { loading, error, data: { posts = [], postsCount = 0 } = {} },
  ] = useLazyQuery(postsQuery, { fetchPolicy: 'no-cache' })
  const [currentPage, setCurrentPage] = useState(0) // page starts with 1, 0 is used to detect initialization
  const [searchText, setSearchText] = useState('')
  const [selected, setSelected] = useState<PostEntityWithMeta<T>[]>([])
  const [showErrorHint, setShowErrorHint] = useState(false)

  const pageSize = 6

  const {
    onChange,
    enableMultiSelect = false,
    minSelectCount = 1,
    maxSelectCount = 3,
  } = props

  const onSave = () => {
    if (
      enableMultiSelect &&
      minSelectCount &&
      selected.length < minSelectCount
    ) {
      setShowErrorHint(true)
      return
    }

    onChange(selected)
  }

  const onCancel = () => {
    onChange([])
  }

  const onSearchBoxChange: SearchBoxOnChangeFn = async (searchInput) => {
    setSearchText(searchInput)
    setCurrentPage(1)
  }

  const onPostsGridSelect: PostEntityOnSelectFn<T> = (postEntity) => {
    setSelected((selected) => {
      const filterdSelected = selected.filter(
        (ele) => (ele.post as PostEntity)?.id !== (postEntity as PostEntity).id
      )

      // deselect the post
      if (filterdSelected.length !== selected.length) {
        return filterdSelected
      }

      // add new selected one and check shrink the array if there is a limit
      if (enableMultiSelect) {
        let newSelected = selected.concat([{ post: postEntity }])

        if (maxSelectCount && newSelected.length >= maxSelectCount) {
          newSelected = newSelected.slice(-maxSelectCount)
        }

        return newSelected
      }

      // single select
      return [{ post: postEntity }]
    })
  }

  const selectedPosts = selected.map((ele: PostEntityWithMeta<T>) => {
    return ele.post
  })

  useEffect(() => {
    if (currentPage !== 0) {
      queryPosts({
        variables: {
          searchText: searchText,
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
        },
      })
    }
  }, [currentPage, searchText])

  let searchResult = (
    <Fragment>
      <PostGrids
        posts={posts}
        selected={selectedPosts}
        onSelect={onPostsGridSelect}
      />
      <Pagination
        currentPage={currentPage}
        total={postsCount}
        pageSize={pageSize}
        onChange={(pageIndex) => {
          setCurrentPage(pageIndex)
        }}
      />
    </Fragment>
  )
  if (loading) {
    searchResult = <p>searching...</p>
  }
  if (error) {
    searchResult = (
      <ErrorWrapper>
        <h3>Errors occurs in the `posts` query</h3>
        <div>
          <br />
          <b>Message:</b>
          <div>{error.message}</div>
          <br />
          <b>Stack:</b>
          <div>{error.stack}</div>
          <br />
          <b>Query:</b>
          <pre>{postsQuery?.loc?.source.body}</pre>
        </div>
      </ErrorWrapper>
    )
  }

  return (
    <DrawerController isOpen={true}>
      <Drawer
        title="Select post"
        actions={{
          cancel: {
            label: 'Cancel',
            action: onCancel,
          },
          confirm: {
            label: 'Confirm',
            action: onSave,
          },
        }}
      >
        <div>
          <PostSearchBox onChange={onSearchBoxChange} />
          <PostSelectionWrapper>
            <div>{searchResult} </div>
            {!!selected.length && <SeparationLine />}
            <PostMetaGrids postMetas={selected} />
            {showErrorHint && (
              <ErrorHint>請至少選擇{minSelectCount}則文章</ErrorHint>
            )}
          </PostSelectionWrapper>
        </div>
      </Drawer>
    </DrawerController>
  )
}
