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
import Transaction from './transaction'

export const listDefinition = {
  User,
  Category,
  Comment,
  Pick,
  Publisher,
  Collection,
  CollectionMember,
  CollectionPick,
  InvitationCode,
  Story,
  Tag,
  Member,
  Notify,
  Announcement,
  Photo: Image,
  Policy,
  Transaction
}
