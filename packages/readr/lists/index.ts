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

export const listDefinition = {
  EditorChoice,
  Photo: Image,
  Author,
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
  Quote
}
