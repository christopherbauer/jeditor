import React from 'react';

import { JEditor } from 'jeditor';
import 'jeditor/dist/index.css';

const App = () => {
	const handleJsonUpdated = (json: any) => {
		console.log(json);
	};
	const exampleJson = {
		Name: 'JSON Editor React Example',
		ID: 1000000000,
		Data: [
			{ Test: 'Chris Test', ID: 1000, enabled: true },
			{ Test: 'Chris Test 2', ID: 40, enabled: false },
			{
				Test: 'Chris Test 3',
				ID: 11,
				enabled: true,
				SubItem: { Test: 'Chris Test 4' },
				SubArr: [{ Title: 'Also chris' }],
			},
		],
	};
	return (
		<div>
            <div><h2>JEditor</h2></div>
			<div>
				<JEditor json={exampleJson} onJsonUpdated={handleJsonUpdated} />;
			</div>
		</div>
	);
};

export default App;
