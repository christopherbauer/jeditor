import React, { useEffect, useRef } from 'react'

export const BooleanNodeEditor = (props: {
  onDataChange: (newValue: any) => void
  defaultValue: boolean
  isEditing: boolean
}) => {
  const selectRef = useRef<HTMLSelectElement>(null)
  useEffect(() => {
    if (props.isEditing) {
      if (selectRef.current) {
        selectRef.current.focus()
      }
    }
  }, [props.isEditing])

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    props.onDataChange(event.target.value === 'true')
  }

  return (
    <select
      ref={selectRef}
      onChange={handleChange}
      onBlur={handleChange}
      value={String(props.defaultValue)}
    >
      <option value='true'>true</option>
      <option value='false'>false</option>
    </select>
  )
}
