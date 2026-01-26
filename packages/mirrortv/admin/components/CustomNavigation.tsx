import {
  NavigationContainer,
  ListNavItem,
  NavItem,
} from '@keystone-6/core/admin-ui/components'
import type { NavigationProps } from '@keystone-6/core/admin-ui/components'
import { Fragment, useEffect } from 'react'

export function CustomNavigation({
  lists,
  authenticatedItem,
}: NavigationProps) {
  // Workaround for site title
  useEffect(() => {
    const currentTitle = document.title
    const newTitle = currentTitle.replace('Keystone', '鏡電視')
    if (newTitle !== currentTitle) document.title = newTitle
  })

  return (
    <NavigationContainer authenticatedItem={authenticatedItem}>
      <NavItem href="/">Dashboard</NavItem>
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
