//shadcnui

'use client'

import React, { useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import Link from "next/link"

import { exit } from '@tauri-apps/api/process';
import { writeTextFile } from '@tauri-apps/api/fs';
import { save } from '@tauri-apps/api/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { cn } from "@/lib/utils"
import { get } from "http";
import { editor } from "monaco-editor";
import { constants } from "perf_hooks";

function getDate() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  return `${month}.${date}.${year}`;
}

const App = () => {

  let viewingMarkdown = false;

  let editorRef = useRef(Editor);

  function handleEditorDidMount(editor: any, monaco: Monaco) {
    editorRef.current = editor;
  }

  function showValue() {
    console.log(editorRef.current.getValue());
  }

  async function onExit() {
    await exit(0);
    console.log("exit");
  }

  async function onSaveAs() {
    const filePath = await save({
      filters: [{
        name: 'Text',
        extensions: ['txt']
      }]
    });
    console.log(filePath);
    await writeTextFile(filePath, editorRef.current.getValue());
    console.log("save as");
  }

  function getEditorContents() {
    return editorRef.current.getValue();
  }

  function renderMarkdown() {
    const contents = getEditorContents();
    console.log(contents);
    // show markdown in new window

  }

  function switchScreen() {
    if(viewingMarkdown) {
      viewingMarkdown = false;
    }
    else {
      viewingMarkdown = true;
    }
    console.log(viewingMarkdown);
    renderUI();
  }

  function renderUI() {
    console.log('render called');
    if (viewingMarkdown == true) {
      return (
        <div>
          <p>hello</p>
        </div>
      )
    }
    else {
      return (
        <div className="overflow-clip">
          <div>
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    <button onClick={onSaveAs}>Save As</button>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>
                    <button onClick={onExit}>Quit</button>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    <button onClick={switchScreen}>
                      {viewingMarkdown ? "View Editor" : "View Markdown"}
                    </button>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>Dev</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    <button onClick={showValue}>
                      Print Editor Contents To Console
                    </button>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
          <div>
            <Editor
              height="80vh"
              defaultLanguage="markdown"
              defaultValue="# Hello, world!"
              onMount={handleEditorDidMount}
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div>
      {renderUI()}
    </div>
  );

};

export default App;
