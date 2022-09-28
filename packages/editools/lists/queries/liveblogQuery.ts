export const liveblogQuery = `  
  id
  name
  slug
  desc
  heroImage {
    name
    imageFile {
      ref
      url
    }
  }
  active
  liveblog_itemsCount
  tags {
    name
  }
  publisher {
    name
    template
  }
  createdAt
  updatedAt
  liveblog_items(where: { status: { equals: "published" } }) {
    id
    title
    status
    publishTime
    heroImage {
      name
      imageFile {
        ref
        url
      }
    }
    author
    name
    boost
    createdAt
    updatedAt
    tags {
      name
    }
    type
    external
    externalCoverPhoto
  }
`
