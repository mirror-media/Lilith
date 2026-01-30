import {
  NavigationContainer,
  ListNavItem,
  NavItem,
} from '@keystone-6/core/admin-ui/components'
import type { NavigationProps } from '@keystone-6/core/admin-ui/components'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'
import { PlusIcon } from '@keystone-ui/icons/icons/PlusIcon'
import { Fragment, useEffect } from 'react'

const USER_ROLE_QUERY = gql`
  query UserRole($id: ID!) {
    user(where: { id: $id }) {
      role
    }
  }
`

export function CustomNavigation({
  lists,
  authenticatedItem,
}: NavigationProps) {
  // Workaround for site title
  useEffect(() => {
    const currentTitle = document.title
    const newTitle = currentTitle.replace('Keystone', '鏡報')
    if (newTitle !== currentTitle) document.title = newTitle
  })

  const userId =
    authenticatedItem.state === 'authenticated' ? authenticatedItem.id : null
  const { data } = useQuery(USER_ROLE_QUERY, {
    variables: { id: userId },
    skip: !userId,
  })
  const isAdmin = data?.user?.role === 'admin'

  return (
    <NavigationContainer authenticatedItem={authenticatedItem}>
      <NavItem href="/">Dashboard</NavItem>
      {isAdmin && <NavItem href="/dashboard">PV Dashboard</NavItem>}
      {/* creat post shortcut */}
      <NavItem key="create-post-shortcut" href="/custom-post-creation">
        Create Post <PlusIcon size="smallish" color="blue" />
      </NavItem>
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
