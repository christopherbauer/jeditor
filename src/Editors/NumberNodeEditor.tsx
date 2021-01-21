import React, { useEffect, useRef } from 'react';

export const NumberNodeEditor = (props: {
	onDataChange: (newValue: any) => void;
	defaultValue: string;
	isEditing: boolean;
}) => {
	const inputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		if (props.isEditing) {
			if (inputRef.current) {
				inputRef.current.focus();
			}
		}
	}, [props.isEditing]);

	const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
		props.onDataChange(parseInt(event.currentTarget.value));
	};
	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if(event.key === "Enter") {
            props.onDataChange(parseInt(event.currentTarget.value));
        }
    };

	return (
		<input
			ref={inputRef}
			type="number"
			onBlur={handleBlur}
			onKeyDown={handleKeyDown}
			defaultValue={props.defaultValue}
		/>
	);
};
