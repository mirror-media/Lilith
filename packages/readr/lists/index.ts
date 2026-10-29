import Post from './Post'
import Tag from './Tag'
import Category from './Category'
import Audio from './Audio'
import Collaboration from './Collaboration'
import Video from './Video'
import Data from './Data'
import Feature from './Feature'
import Gallery from './Gallery'
import Project from './Project'
import Quote from './Quote'
import EditorChoice from './EditorChoice'
import User from './User'
import Author from './Author'
import Image from './Image'
import ProjectChecklist from './ProjectChecklist'
import ProjectNote from './ProjectNote'
import NoteCategory from './NoteCategory'
import Award from './Award'
import PageVariable from './PageVariable'
import envVar from '../environment-variables'

export const listDefinition = {
  EditorChoice,
  Photo: Image,
  Author,
  PageVariable,
  Award,
  Video,
  AudioFile: Audio,
  Tag,
  Category,
  User,
  Post,
  Collaboration,
  DataSet: Data,
  Feature,
  Gallery,
  Project,
  ProjectChecklist,
  ProjectNote,
  NoteCategory,
  Quote,
}

// Enforce read-only access for every READr list, including User's bootstrap
// access rules, without changing the shared ACL used by other packages.
if (envVar.accessControlStrategy === 'gql') {
  for (const list of Object.values(listDefinition)) {
    const access = list.access
    const operation = typeof access === 'function' ? access : access.operation
    list.access = {
      ...(typeof access === 'function' ? {} : access),
      operation: (args) => {
        if (args.operation !== 'query') return false
        return typeof operation === 'function'
          ? operation(args)
          : operation.query({ ...args, operation: 'query' })
      },
    }
  }
}
