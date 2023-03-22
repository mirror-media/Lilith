export type Image = {
  id?: string
  desc?: string
  imageFile?: ImageFile
  name?: string
}

export type ImageFile = {
  url?: string
}

export type Resized = {
  original?: string
  w480?: string
  w800?: string
  w1200?: string
  w1600?: string
  w2400?: string
}
