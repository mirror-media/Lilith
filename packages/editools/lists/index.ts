import User from './User'
import LiveblogItem from './LiveblogItem'
import Liveblog from './Liveblog'
import Publisher from './Publisher'
import Audio from './Audio'
import Video from './Video'
import Image from './Image'
import Tag from './Tag'
import Form from './Form'
import Field from './Field'
import FieldOption from './FieldOption'
import FormAnswer from './FormAnswer'
import FormResult from './FormResult'
import Condition from './Condition'
import Conditions from './Conditions'
import Question from './Question'
import EmbedCode from './EmbedCode'
import Karaoke from './Karaoke'
import IndexItem from './IndexItem'
import InlineIndex from './InlineIndex'
import QAList from './QAList'
import QAItem from './QAItem'
import FeedbackCounter from './FeedbackCounter'
import VideoPicker from './VideoPicker'
import ThreeStoryPoints from './ThreeStoryPoints'
import DualSlides from './DualSlides'
import ComponentHelp from './ComponentHelp'

export const listDefinition = {
  User,
  LiveblogItem,
  Liveblog,
  Publisher,
  AudioFile: Audio, // workaround：K6不支持Audio作為list name，因為複數問題（但不知為何Video就可以）
  Video,
  Photo: Image,
  Tag,
  Form,
  Field,
  FieldOption,
  FormAnswer,
  FormResult,
  Condition,
  ConditionCollection: Conditions,
  Question,
  EmbedCode,
  InlineIndex,
  IndexItem,
  Karaoke,
  VideoPicker,
  QAList,
  QAItem,
  FeedbackCounter,
  ThreeStoryPoint: ThreeStoryPoints,
  DualSlide: DualSlides,
  ComponentHelp,
}
