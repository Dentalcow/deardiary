//shadcnui

"use client"

import React, { useRef, useEffect } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import Link from "next/link"

import { exit } from '@tauri-apps/api/process';
import { writeTextFile, exists, createDir } from '@tauri-apps/api/fs';
import { save } from '@tauri-apps/api/dialog';
import { documentDir } from '@tauri-apps/api/path';

import { useToast } from "@/components/ui/use-toast";

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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { cn } from "@/lib/utils"
import { get } from "http";
import { editor } from "monaco-editor";
import { constants, monitorEventLoopDelay } from "perf_hooks";

type Entry = {
  title: string;
  content: string;
  date: string;
}

function getDate() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  return `${month}.${date}.${year}`;
}

const App = () => {

  const { toast } = useToast()

  let editorRef = useRef(editor);

  function handleEditorDidMount(editor: any, monaco: Monaco) {
    editorRef.current = editor;

    import('monaco-themes/themes/Twilight.json')
      .then(data => {
        monaco.editor.defineTheme('twilight', data);
        monaco.editor.setTheme('twilight');
      })
  }

  function getEditorContents() {
    return editorRef.current.getValue();
  }

  function showValue() {
    console.log(getEditorContents());
    toast({
      title: "Editor Contents",
      description: "Check the console for the editor contents",
    })
  }

  async function onExit() {
    await exit(0);
  }

  async function onSave() {
    const documentDirPath = (await documentDir()).replace(/\\/g, '/');
    if (!(await exists(documentDirPath + "deardiary/"))) {
      await createDir(documentDirPath + "deardiary/");
    }
    let filePath = documentDirPath + "deardiary/" + getDate();
    console.log(filePath);  
    let fileName = "diary entry for " + getDate();

    let fileContents: Entry = {
      title: fileName,
      content: getEditorContents(),
      date: getDate(),
    }

    await writeTextFile(filePath + ".json", JSON.stringify(fileContents));
    toast({
      title: "Entry Added",
      description: filePath,
    })

  }

  async function onSaveAs() {
    const filePath = await save({
      filters: [{
        name: 'Text',
        extensions: ['txt']
      }]
    });
    await writeTextFile(filePath, getEditorContents());
    toast({
      title: "Entry Exported",
      description: filePath,
    })
  }

  const options: Monaco.IStandaloneEditorConstructionOptions = {
    readOnly: false,
    minimap: { enabled: false },
  };

  return (
    <div>
      <div>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <button onClick={onSave}>Add Entry</button>
              </MenubarItem>
              <MenubarItem>
                <button onClick={onSaveAs}>Export</button>
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
                <Link href="/viewer">Launch Viewer</Link>
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
          height="93vh"
          theme="vs-dark"
          options={options}
          defaultLanguage="markdown"
          defaultValue="# Hello, world!"
          onMount={handleEditorDidMount}
        />
      </div>
    </div >
  );

};

export default App;
