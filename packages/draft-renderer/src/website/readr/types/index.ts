type ResizedImages = {
  original?: string
  w480?: string
  w800?: string
  w1200?: string
  w1600?: string
  w2400?: string
}

type PhotoWithResizedOnly = { resized: ResizedImages | null }

enum ValidPostStyle {
  NEWS = 'news',
  FRAME = 'frame',
  BLANK = 'blank',
  REPORT = 'report',
  PROJECT3 = 'project3',
  EMBEDDED = 'embedded',
  REVIEW = 'review',
  MEMO = 'memo',
  DUMMY = 'dummy',
  CARD = 'card',
  QA = 'qa',
  SCROLLABLE_VIDEO = 'scrollablevideo',
}

export enum ValidPostContentType {
  SUMMARY = 'summary',
  NORMAL = 'normal',
  ACTIONLIST = 'actionlist',
  CITATION = 'citation',
}

export type Post = {
  id: string
  slug: string
  style: ValidPostStyle
  title: string // alias to `name`
  publishTime: string
  readingTime: number
  heroImage: PhotoWithResizedOnly | null
  ogImage: PhotoWithResizedOnly | null
}
