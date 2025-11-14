export enum UserRole {
  Admin = 'admin',
  Moderator = 'moderator',
  Editor = 'editor',
  Contributor = 'contributor',
}

export enum State {
  Active = 'active',
  Inactive = 'inactive',
  Published = 'published',
  Draft = 'draft',
  Scheduled = 'scheduled',
  Archived = 'archived',
  Invisible = 'invisible', // hidden from listing, but can be accessed by single item
}

export enum ACL {
  GraphQL = 'gql',
  Preview = 'preview',
  CMS = 'cms',
}

export type Session = {
  data: {
    id: string
    role: UserRole
  }
}

export enum ContactRole {
  Writer = 'writer',
  Photographer = 'photographer',
  CameraMan = 'camera_man',
  Designer = 'designer',
  Engineer = 'engineer',
  Vocal = 'vocal',
}
