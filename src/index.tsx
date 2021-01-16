import React, { useState } from 'react'
import { IDictionary } from './lib/IDictionary'
import { BooleanNodeEditor } from './BooleanNodeEditor'
import { NumberNodeEditor } from './NumberNodeEditor'
import { StringNodeEditor } from './StringNodeEditor'
import { createUseStyles } from 'react-jss'
enum EditorTypes {
  object,
  string,
  number,
  boolean,
  array
}
const getDisplayKVP = (json: IDictionary<any>, path: string[]) => {
  for (var i = 0; i < path.length - 1; i++) {
    const level = path[i]
    json = json[level]
  }
  const lastPath = path[path.length - 1]
  return { key: lastPath, value: json[lastPath] }
}

const DisplayEditor = (props: {
  json: IDictionary<any>
  path: string[]
  type: EditorTypes
  children: React.ReactNode
  className?: string
  onJsonUpdated: (json: IDictionary<any>) => void
}) => {
  const { path, json, type } = props
  const [isEditing, setEditing] = useState<boolean>(false)
  const kvp = getDisplayKVP(props.json, path)

  const handleDivClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setEditing(true)
  }

  const handleDataChange = (newValue: any) => {
    // eslint-disable-next-line prefer-const
    let newJson = json,
      curJson = newJson,
      edited = false
    for (let i = 0; i < path.length; i++) {
      const curLevel = path[i]
      if (i < path.length - 1) {
        curJson = curJson[curLevel]
      } else {
        edited = curJson[curLevel] !== newValue
        curJson[curLevel] = newValue
      }
    }
    if (edited) {
      props.onJsonUpdated({ ...newJson })
    }
    setEditing(false)
  }

  const canEdit =
    [EditorTypes.string, EditorTypes.boolean, EditorTypes.number].indexOf(
      type
    ) > -1
  if (isEditing && canEdit) {
    const STATE_COMPONENT = {
      [EditorTypes.string]: (
        <StringNodeEditor
          onDataChange={handleDataChange}
          defaultValue={kvp.value}
          isEditing
        />
      ),
      [EditorTypes.boolean]: (
        <BooleanNodeEditor
          onDataChange={handleDataChange}
          defaultValue={kvp.value}
          isEditing
        />
      ),
      [EditorTypes.number]: (
        <NumberNodeEditor
          onDataChange={handleDataChange}
          defaultValue={kvp.value}
          isEditing
        />
      ),
      [EditorTypes.array]: null,
      [EditorTypes.object]: null
    }

    return (
      <div
        className='jsoneditor-kvp'
        onClick={(event) => event.stopPropagation()}
      >
        "{kvp.key}": {STATE_COMPONENT[type]}
      </div>
    )
  } else {
    return (
      <div
        onClick={canEdit ? handleDivClick : undefined}
        className={props.className}
      >
        {props.children}
      </div>
    )
  }
}

const useStyles = createUseStyles({
  jsonEditorContainer: {
    margin: {
      top: 5,
      left: 20,
      right: 0,
      bottom: 20
    }
  }
})

export const JEditor = (json: any) => {
  const classes = useStyles()
  const [curJson, setCurJson] = useState<any>(json)
  const keyFormat = (key: string) => `"${key}"`

  const formatJSON = (json: any, path: any[]): React.ReactNode => {
    const keys = Object.keys(json)
    const nodeArray = []
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const jsonValue = json[key]
      const curPath = path.concat(key)
      if (Array.isArray(jsonValue)) {
        const arrValue = jsonValue as unknown[]
        const arrNodeArray = []
        for (let j = 0; j < arrValue.length; j++) {
          const curPath = path.concat(key, j)
          const subArr = arrValue[j]
          arrNodeArray.push(
            <DisplayEditor
              json={curJson}
              path={curPath}
              type={EditorTypes.object}
              onJsonUpdated={(newJson) => setCurJson(newJson)}
            >
              &#123; {formatJSON(subArr, curPath)} &#125;{' '}
              {j < arrValue.length - 1 ? ',' : ''}
            </DisplayEditor>
          )
        }
        nodeArray.push(
          <DisplayEditor
            json={curJson}
            path={curPath}
            type={EditorTypes.array}
            onJsonUpdated={(newJson) => setCurJson(newJson)}
          >
            &#91;-&#93; {keyFormat(key)}: [ {arrNodeArray} ]
          </DisplayEditor>
        )
      } else {
        switch (typeof jsonValue) {
          case 'string':
            nodeArray.push(
              <DisplayEditor
                json={curJson}
                path={curPath}
                type={EditorTypes.string}
                onJsonUpdated={(newJson) => setCurJson(newJson)}
              >
                {keyFormat(key)}:{' '}
                <span className='json-editor-interact json-editor-string'>
                  "{jsonValue}"
                </span>{' '}
                {i < keys.length - 1 ? ',' : ''}
              </DisplayEditor>
            )
            break
          case 'number':
            nodeArray.push(
              <DisplayEditor
                json={curJson}
                path={curPath}
                type={EditorTypes.number}
                onJsonUpdated={(newJson) => setCurJson(newJson)}
              >
                {keyFormat(key)}:{' '}
                <span className='json-editor-interact json-editor-number'>
                  {jsonValue}
                </span>{' '}
                {i < keys.length - 1 ? ',' : ''}
              </DisplayEditor>
            )
            break
          case 'boolean':
            nodeArray.push(
              <DisplayEditor
                json={curJson}
                path={curPath}
                type={EditorTypes.boolean}
                onJsonUpdated={(newJson) => setCurJson(newJson)}
              >
                {keyFormat(key)}:{' '}
                <span
                  className={`json-editor-interact json-editor-bool-${jsonValue}`}
                >
                  {jsonValue.toString()}
                </span>{' '}
                {i < keys.length - 1 ? ',' : ''}
              </DisplayEditor>
            )
            break
          default:
            nodeArray.push(
              <DisplayEditor
                json={curJson}
                path={curPath}
                type={EditorTypes.object}
                onJsonUpdated={(newJson) => setCurJson(newJson)}
              >
                {keyFormat(key)}: &#123; {formatJSON(jsonValue, curPath)} &#125;{' '}
                {i < keys.length - 1 ? ',' : ''}
              </DisplayEditor>
            )
            break
        }
      }
    }
    return nodeArray
  }
  console.log(curJson)
  return (
    <div className={classes.jsonEditorContainer}>
      {curJson && formatJSON(curJson, [])}
    </div>
  )
}
