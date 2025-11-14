import {
  NavigationContainer,
  ListNavItem,
  NavItem,
} from '@keystone-6/core/admin-ui/components'
import type { NavigationProps } from '@keystone-6/core/admin-ui/components'
/* import { PlusIcon } from '@keystone-ui/icons/icons/PlusIcon' */

import { Fragment } from 'react'
export function CustomNavigation({
  lists,
  authenticatedItem,
}: NavigationProps) {
  return (
    <NavigationContainer authenticatedItem={authenticatedItem}>
      <NavItem href="/">Dashboard</NavItem>
      {/* creat post shortcut */}
      {/* <NavItem key="create-post-shortcut" href="/custom-post-creation">
        Create Post <PlusIcon size="smallish" color="blue" />
      </NavItem> */}
      {lists.map((list) => {
        const key = list.key

        if (key === 'Photo') {
          return (
            <Fragment key={key}>
              <ListNavItem key={key} list={list} />
              <NavItem key="multi-images" href="/multi-images">
                Multi Images
              </NavItem>
            </Fragment>
          )
        } else return <ListNavItem key={key} list={list} />
      })}
    </NavigationContainer>
  )
}
