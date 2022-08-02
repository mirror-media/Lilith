import User from './User'
import Post from './Post'
import Tag from './Tag'
import Classify from './Classify'
import Category from './Category'
import Group from './Group'
import Sdg from './Sdg'
import Project from './Project'
import Latest from './Latest'
import Event from './Event'
import Audio from './Audio'
import Author from './Author'
import Video from './Video'
import Poll from './Poll'
import PollOption from './PollOption'
import PollResult from './PollResult'
import EditorChoice from './EditorChoice'
import PromoteStory from './PromoteStory'
import PromoteEvent from './PromoteEvent'
import Influence from './Influence'
import Image from './Image'
import Banner from './Banner'
import Download from './Download'
import InfoGraph from './InfoGraph'
import Longform from './Longform'

export const listDefinition = {
  User,
  Post,
  Tag,
  Classify,
  Category,
  Group: Group,
  SDG: Sdg,
  Project,
  LatestNew: Latest,
  Event,
  EditorChoice,
  PromoteStory,
  PromoteEvent,
  Influence,
  AudioFile: Audio, // workaround：K6不支持Audio作為list name，因為複數問題（但不知為何Video就可以）
  Author,
  Video,
  Photo: Image,
  Poll,
  PollOption,
  PollResult,
  Banner,
  Download,
  InfoGraph,
  Longform,
}
