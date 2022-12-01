export const liveblogQuery = buildLiveBlogQuery()
export const liveblogQueryWith5Items = buildLiveBlogQuery(5)

export function buildLiveBlogQuery(take?: number) {
  return `
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
    imageCaption
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
    liveblog_items(where: { status: { equals: "published" }}${
      take ? ', take:' + take : ''
    } ) {
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
}
