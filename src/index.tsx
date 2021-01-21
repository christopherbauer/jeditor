import React, { useEffect, useRef, useState } from 'react';
import { IDictionary } from './lib/IDictionary';
import { BooleanNodeEditor, NumberNodeEditor, StringNodeEditor } from './Editors';
import { createUseStyles } from 'react-jss';

interface Props {
	json: IDictionary<any>;
	onJsonUpdated?: (json: IDictionary<any>) => void;
}

enum EditorTypes {
	object,
	string,
	number,
	boolean,
	array,
}
const getDisplayKVP = (json: IDictionary<any>, path: string[]) => {
	for (var i = 0; i < path.length - 1; i++) {
		const level = path[i];
		json = json[level];
	}
	const lastPath = path[path.length - 1];
	return { key: lastPath, value: json[lastPath] };
};

const DisplayEditor = (props: {
	json: IDictionary<any>;
	path: string[];
	type: EditorTypes;
	children: React.ReactNode;
	className?: string;
	onJsonUpdated: (json: IDictionary<any>) => void;
}) => {
	const classes = useStyles();
	const { path, json, type } = props;
	const [isEditing, setEditing] = useState<boolean>(false);
	const kvp = getDisplayKVP(props.json, path);

	const handleDivClick = (event: React.MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		setEditing(true);
	};

	const handleDataChange = (newValue: any) => {
		// eslint-disable-next-line prefer-const
		let newJson = json,
			curJson = newJson,
			edited = false;
		for (let i = 0; i < path.length; i++) {
			const curLevel = path[i];
			if (i < path.length - 1) {
				curJson = curJson[curLevel];
			} else {
				edited = curJson[curLevel] !== newValue;
				curJson[curLevel] = newValue;
			}
		}
		if (edited) {
			props.onJsonUpdated({ ...newJson });
		}
		setEditing(false);
	};

	const canEdit = [EditorTypes.string, EditorTypes.boolean, EditorTypes.number].indexOf(type) > -1;
	if (isEditing && canEdit) {
		const STATE_COMPONENT = {
			[EditorTypes.string]: (
				<StringNodeEditor onDataChange={handleDataChange} defaultValue={kvp.value} isEditing />
			),
			[EditorTypes.boolean]: (
				<BooleanNodeEditor onDataChange={handleDataChange} defaultValue={kvp.value} isEditing />
			),
			[EditorTypes.number]: (
				<NumberNodeEditor onDataChange={handleDataChange} defaultValue={kvp.value} isEditing />
			),
			[EditorTypes.array]: null,
			[EditorTypes.object]: null,
		};

		return (
			<div className="jsoneditor-kvp" onClick={(event) => event.stopPropagation()}>
				"{kvp.key}": {STATE_COMPONENT[type]}
			</div>
		);
	} else {
		return (
			<div className={classes.editorNode} onClick={canEdit ? handleDivClick : undefined}>
				{props.children}
			</div>
		);
	}
};

const useStyles = createUseStyles({
	jsonEditorContainer: {
		backgroundColor: '#1E1E1E',
		margin: ['1em'],
		padding: ['1em'],
		width: '50%',
		borderRadius: 10,
        '& pre': {
            position: 'relative',
            border: [1, 'solid', '#404040'],
            color: '#9CDCFE'
        }
    },
    editorNode: {
        margin: [5, 20, 0, 20],
        border: [1, 'solid', '#404040'],
        borderRadius: 5,
        padding: [5, 0, 5, 5],
        backgroundColor: '#1d1d1d',
    },
    editorMenu: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 5
    },
	jsonArray: {},
	jsonEditorKey: {
		color: '#9CDCFE',
	},
	interact: {
		cursor: 'pointer',
	},
	editorNumber: {
		fontStyle: 'italic',
		color: '#93CEA8',
	},
	editorString: {
		fontStyle: 'italic',
		color: '#CE723B',
	},
	editorBoolean: {
		fontStyle: 'italic',
		color: '#569CCA',
	},
	jsonEditorEditInit: {
		cursor: 'pointer',
		margin: 0,
	},
});

export const JEditor = ({ json }: Props) => {
	let jsonEditorRef = useRef<HTMLDivElement>(null);
	const classes = useStyles();
	const [curJson, setCurJson] = useState<any>(json);
    const [editing, setEditing] = useState(false);
    const [showContainerEditor, setShowContainerEditor] = useState(false);
	const keyFormat = (key: string) => <span className={classes.jsonEditorKey}>{key}</span>;

	const handleDocumentClick = (event: MouseEvent) => {
		if (jsonEditorRef.current && !jsonEditorRef.current.contains(event.target as Node)) {
			setEditing(false);
			document.removeEventListener('mousedown', handleDocumentClick);
		}
    };
    const handleShowEditorMenu = () => {
        setShowContainerEditor(true);
    }
    const handleHideEditorMenu = () => {
        setShowContainerEditor(false);
    }

	useEffect(() => {
		if (editing) {
			document.addEventListener('mousedown', handleDocumentClick);
		}
	}, [editing, jsonEditorRef]);

	const formatJSON = (json: any, path: any[]): React.ReactNode => {
		const keys = Object.keys(json);
		const nodeArray = [];
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const jsonValue = json[key];
			const curPath = path.concat(key);
			if (Array.isArray(jsonValue)) {
				const arrValue = jsonValue as unknown[];
				const arrNodeArray = [];
				for (let j = 0; j < arrValue.length; j++) {
					const curPath = path.concat(key, j);
					const subArr = arrValue[j];
					arrNodeArray.push(
						<DisplayEditor
							json={curJson}
							path={curPath}
							type={EditorTypes.object}
							onJsonUpdated={(newJson) => setCurJson(newJson)}
						>
							&#123; {formatJSON(subArr, curPath)} &#125; {j < arrValue.length - 1 ? ',' : ''}
						</DisplayEditor>
					);
				}
				nodeArray.push(
					<DisplayEditor
						json={curJson}
						path={curPath}
						type={EditorTypes.array}
						onJsonUpdated={(newJson) => setCurJson(newJson)}
					>
						{keyFormat(key)}: [ {arrNodeArray} ]
					</DisplayEditor>
				);
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
								<span className={`${classes.interact} ${classes.editorString}`}>"{jsonValue}"</span>{' '}
								{i < keys.length - 1 ? ',' : ''}
							</DisplayEditor>
						);
						break;
					case 'number':
						nodeArray.push(
							<DisplayEditor
								json={curJson}
								path={curPath}
								type={EditorTypes.number}
								onJsonUpdated={(newJson) => setCurJson(newJson)}
							>
								{keyFormat(key)}:{' '}
								<span className={`${classes.interact} ${classes.editorNumber}`}>{jsonValue}</span>{' '}
								{i < keys.length - 1 ? ',' : ''}
							</DisplayEditor>
						);
						break;
					case 'boolean':
						nodeArray.push(
							<DisplayEditor
								json={curJson}
								path={curPath}
								type={EditorTypes.boolean}
								onJsonUpdated={(newJson) => setCurJson(newJson)}
							>
								{keyFormat(key)}:{' '}
								<span className={`${classes.interact} ${classes.editorBoolean}`}>
									{jsonValue.toString()}
								</span>{' '}
								{i < keys.length - 1 ? ',' : ''}
							</DisplayEditor>
						);
						break;
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
						);
						break;
				}
			}
		}
		return nodeArray;
	};
	return (
		<div ref={jsonEditorRef} className={classes.jsonEditorContainer}>
			{curJson && editing ? (
				formatJSON(curJson, [])
			) : (
				<pre onMouseEnter={handleShowEditorMenu} onMouseLeave={handleHideEditorMenu} className={classes.jsonEditorEditInit} onClick={() => setEditing(true)}>
                    { showContainerEditor && <EditorMenu /> }
					{JSON.stringify(curJson, null, 4)}
				</pre>
			)}
		</div>
	);
};

interface IEditorMenuProps {

}
const EditorMenu: React.FC<IEditorMenuProps> = () => {
	const classes = useStyles();
    return <div className={classes.editorMenu}><button>Edit</button></div>;
}