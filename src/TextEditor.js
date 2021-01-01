import React, { useCallback, useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';

const TextEditor = ({ onChange }) => {
  // Create a Slate editor object that won't change across renders.
  const editor = useMemo(() => withReact(createEditor()), []);

  // Keep track of state for the value of the editor.
  const [value, setValue] = useState([
    { type: 'paragraph', children: [{ text: '' }] },
  ]);

  const handleOnChange = useCallback(
    (newValue) => {
      console.log(newValue);
      setValue(newValue);
      if (onChange) onChange(newValue);
    },
    [setValue, onChange]
  );

  return (
    <Slate editor={editor} value={value} onChange={handleOnChange}>
      <Editable data-testid="text-editor" />
    </Slate>
  );
};

export default TextEditor;
