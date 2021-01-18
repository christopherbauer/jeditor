import React from 'react'

import { JEditor } from 'jeditor'
import 'jeditor/dist/index.css'

const App = () => {
  return <JEditor json={[ { Test: "Chris Test", ID: 1000, enabled: true }, { Test: "Chris Test 2", ID: 40, enabled: false }, { Test: "Chris Test 3", ID: 11, enabled: true, SubItem: { Test: "Chris Test 4" }, SubArr: [ { Title: "Also chris" } ] } ] } />
}

export default App
