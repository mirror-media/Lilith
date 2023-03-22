import React from 'react'
import styled from 'styled-components'

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: end;
`

const Arrows = styled.div`
  display: flex;
`

const ArrowButtonWrapper = styled.a`
  color: #415269;
  cursor: pointer;
  ${({ disable }) => {
    if (disable) {
      return `
        pointer-events: none;
        opacity: 0.65;
        cursor: unset;
      `
    }
  }}
`

export function Pagination({ currentPage, total, pageSize, onChange }) {
  const minPage = 1
  const limit = Math.ceil(total / pageSize)
  const nextPage = currentPage + 1
  const prevPage = currentPage - 1

  // Don't render the pagiantion component if the pageSize is greater than the total number of items in the list.
  if (total <= pageSize) return null

  return (
    <PaginationWrapper>
      <div>
        {currentPage} of {limit} pages
      </div>
      <Arrows>
        <ArrowButtonWrapper
          onClick={() => {
            onChange(prevPage)
          }}
          disable={prevPage < minPage}
        >
          <svg
            aria-hidden="true"
            focusable="false"
            height="24px"
            width="24px"
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="css-bztyua"
          >
            <polyline points="15 18 9 12 15 6"></polyline>{' '}
          </svg>
        </ArrowButtonWrapper>
        <ArrowButtonWrapper
          onClick={() => {
            onChange(nextPage)
          }}
          disable={nextPage > limit}
        >
          <svg
            aria-hidden="true"
            focusable="false"
            height="24px"
            width="24px"
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="css-bztyua"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </ArrowButtonWrapper>
      </Arrows>
    </PaginationWrapper>
  )
}
