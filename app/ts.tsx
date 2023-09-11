'use client'

import React, { useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";

const TS = () => {
  const editorRef = useRef(null);

  function handleEditorDidMount(editor: any, _: Monaco) {
    // here is the editor instance
    // you can store it in `useRef` for further usage
    console.log("hhh");
    editorRef.current = editor;
  }

  return (
    <div>
      <Editor
        height="90vh"
        defaultLanguage="javascript"
        defaultValue="// some commentssss"
        onMount={handleEditorDidMount}
      />
    </div>
  );
};

export default TS;
