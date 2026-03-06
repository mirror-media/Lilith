import { ContactRole } from '../../../../type'

export const getFilterFromFieldConfig = (fieldName: string) => {
  switch (fieldName) {
    case 'writers':
      return [ContactRole.Writer]
    case 'photographers':
      return [ContactRole.Photographer]
    case 'camera_man':
      return [ContactRole.CameraMan]
    case 'designers':
      return [ContactRole.Designer]
    case 'engineers':
      return [ContactRole.Engineer]
    case 'vocals':
      return [ContactRole.Vocal]
    default:
      console.log(`field ${fieldName} is not handled`)
      return null
  }
}
