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
import Award from './Award'
import User from './User'
import Image from './Image'
import Banner from './Banner'
import Download from './Download'
import InfoGraph from './InfoGraph'
import Longform from './Longform'

export const listDefinition = {
  Post,
  Classify,
  Category,
  Group: Group,
  Photo: Image,
  Banner,
  EditorChoice,
  InfoGraph,
  Project,
  LatestNew: Latest,
  Event,
  PromoteStory,
  PromoteEvent,
  Influence,
  AudioFile: Audio, // workaround：K6不支持Audio作為list name，因為複數問題（但不知為何Video就可以）
  Author,
  Video,
  Tag,
  Poll,
  PollOption,
  PollResult,
  SDG: Sdg,
  Award,
  User,
  Download,
  Longform,
}
