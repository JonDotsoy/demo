export const isObject = (value: unknown): value is Record<any, any> => typeof value === 'object' && value !== null
export const hasProperty = <T extends string>(value: unknown, prop: T): value is { [k in T]: unknown } => isObject(value) && Reflect.has(value, prop)
export const isString = (value: unknown): value is string => typeof value === 'string'
export const isArray = Array.isArray;
export const every = <T>(value: unknown[], test: (value: unknown) => boolean): value is T[] => value.every(test)

export const parseConfigEditor = (value: unknown) => isObject(value)
  && hasProperty(value, 'editor')
  && isArray(value.editor)
  && every<string>(value.editor, isString)
  ? value.editor
  : null

export const parseConfigEditorWatch = (value: unknown) => isObject(value)
  && hasProperty(value, 'editorWatch')
  && isArray(value.editorWatch)
  && every<string>(value.editorWatch, isString)
  ? value.editorWatch
  : null
