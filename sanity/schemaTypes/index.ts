import { type SchemaTypeDefinition } from 'sanity'
import { interviewer } from './interviewer'
import { interview } from './interview'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [interviewer,interview],
}
