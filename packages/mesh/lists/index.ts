import User from './user'
import Category from './category'
import Comment from './comment'
import Member from './member'
import Pick from './pick'
import Story from './story'
import Tag from './tag'
import Publisher from './publisher'
import Collection from './collection'
import CollectionMember from './collection_member'
import CollectionPick from './collection_pick'
import InvitationCode from './invitation_code'
import Image from './image'
import Notify from './notify'
import Announcement from './announcement'
import Policy from './policy'
import Podcast from './podcast'
import Transaction from './transaction'
import Sponsorship from './sponsorship'
import InvalidName from './invalid_name'
import Exchange from './exchange'
import ReportReason from './report_reason'
import ReportRecord from './report_record'
import Revenue from './revenue'
import Statement from './statement'
import StoryType from './story_type'
import ActivityPubActor from './activitypub_actor'
import Activity from './activity'
import InboxItem from './inbox_item'
import OutboxItem from './outbox_item'
import FederationInstance from './federation_instance'
import FederationConnection from './federation_connection'
import AccountDiscovery from './account_discovery'
import AccountMapping from './account_mapping'
import AccountSyncTask from './account_sync_task'

export const listDefinition = {
  User,
  InvalidName,
  Category,
  Comment,
  Pick,
  Publisher,
  Collection,
  CollectionMember,
  CollectionPick,
  InvitationCode,
  Story,
  StoryType,
  ActivityPubActor,
  Activity,
  InboxItem,
  OutboxItem,
  FederationInstance,
  FederationConnection,
  AccountDiscovery,
  AccountMapping,
  AccountSyncTask,
  Tag,
  Member,
  Notify,
  Announcement,
  Photo: Image,
  Policy,
  Podcast,
  Transaction,
  Sponsorship,
  Exchange,
  ReportReason,
  ReportRecord,
  Revenue,
  Statement,
}
