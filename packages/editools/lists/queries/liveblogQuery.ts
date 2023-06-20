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
          url
          width
          height
        }
      }
      imageCaption
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
