import React, { useEffect, useRef } from 'react'

export const StringNodeEditor = (props: {
  onDataChange: (newValue: any) => void
  defaultValue: string
  isEditing: boolean
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (props.isEditing) {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }, [props.isEditing])

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    props.onDataChange(event.currentTarget.value)
  }

  return (
    <input
      ref={inputRef}
      type='text'
      onBlur={handleBlur}
      defaultValue={props.defaultValue}
    />
  )
}
