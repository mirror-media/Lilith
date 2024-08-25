import styled from 'styled-components'
import { useAppDispatch } from '../redux/hooks'
import { createFilesHandler } from '../utils'
import { addImageFiles } from '../redux/features/multi-images/slice'
import { forwardRef, type ChangeEvent } from 'react'

const Input = styled.input`
  display: none;
`

type Props = {
  id?: string
}

const HiddenInput = forwardRef<HTMLInputElement, Props>(({ id }, ref) => {
  const dispatch = useAppDispatch()
  const changeHandler = createFilesHandler((files) =>
    dispatch(addImageFiles(files))
  )

  const inputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    changeHandler(event.target.files)
    event.target.files = null
  }

  return (
    <Input
      id={id}
      type="file"
      multiple={true}
      accept="image/*"
      ref={ref}
      onChange={inputChangeHandler}
    />
  )
})

export default HiddenInput
