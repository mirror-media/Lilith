import styled from 'styled-components'
import { PageContainer } from '@keystone-6/core/admin-ui/components'
import { Heading } from '@keystone-ui/core'

const H1 = styled.h1`
  color: red;
`

export default function MultiImages() {
  return (
    <PageContainer
      title="Multi Images"
      header={<Heading type="h3">Multi Images</Heading>}
    >
      <H1>This is multi images</H1>
    </PageContainer>
  )
}
