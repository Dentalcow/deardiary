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

const TwilightTheme:editor.IStandaloneThemeData = {
  "base": "vs-dark",
  "inherit": true,
  "rules": [
    {
      "background": "141414",
      "token": ""
    },
    {
      "foreground": "5f5a60",
      "fontStyle": "italic",
      "token": "comment"
    },
    {
      "foreground": "cf6a4c",
      "token": "constant"
    },
    {
      "foreground": "9b703f",
      "token": "entity"
    },
    {
      "foreground": "cda869",
      "token": "keyword"
    },
    {
      "foreground": "f9ee98",
      "token": "storage"
    },
    {
      "foreground": "8f9d6a",
      "token": "string"
    },
    {
      "foreground": "9b859d",
      "token": "support"
    },
    {
      "foreground": "7587a6",
      "token": "variable"
    },
    {
      "foreground": "d2a8a1",
      "fontStyle": "italic underline",
      "token": "invalid.deprecated"
    },
    {
      "foreground": "f8f8f8",
      "background": "562d56bf",
      "token": "invalid.illegal"
    },
    {
      "background": "b0b3ba14",
      "token": "text source"
    },
    {
      "background": "b1b3ba21",
      "token": "text.html.ruby source"
    },
    {
      "foreground": "9b5c2e",
      "fontStyle": "italic",
      "token": "entity.other.inherited-class"
    },
    {
      "foreground": "daefa3",
      "token": "string source"
    },
    {
      "foreground": "ddf2a4",
      "token": "string constant"
    },
    {
      "foreground": "e9c062",
      "token": "string.regexp"
    },
    {
      "foreground": "cf7d34",
      "token": "string.regexp constant.character.escape"
    },
    {
      "foreground": "cf7d34",
      "token": "string.regexp source.ruby.embedded"
    },
    {
      "foreground": "cf7d34",
      "token": "string.regexp string.regexp.arbitrary-repitition"
    },
    {
      "foreground": "8a9a95",
      "token": "string variable"
    },
    {
      "foreground": "dad085",
      "token": "support.function"
    },
    {
      "foreground": "cf6a4c",
      "token": "support.constant"
    },
    {
      "foreground": "8996a8",
      "token": "meta.preprocessor.c"
    },
    {
      "foreground": "afc4db",
      "token": "meta.preprocessor.c keyword"
    },
    {
      "foreground": "494949",
      "token": "meta.tag.sgml.doctype"
    },
    {
      "foreground": "494949",
      "token": "meta.tag.sgml.doctype entity"
    },
    {
      "foreground": "494949",
      "token": "meta.tag.sgml.doctype string"
    },
    {
      "foreground": "494949",
      "token": "meta.tag.preprocessor.xml"
    },
    {
      "foreground": "494949",
      "token": "meta.tag.preprocessor.xml entity"
    },
    {
      "foreground": "494949",
      "token": "meta.tag.preprocessor.xml string"
    },
    {
      "foreground": "ac885b",
      "token": "declaration.tag"
    },
    {
      "foreground": "ac885b",
      "token": "declaration.tag entity"
    },
    {
      "foreground": "ac885b",
      "token": "meta.tag"
    },
    {
      "foreground": "ac885b",
      "token": "meta.tag entity"
    },
    {
      "foreground": "e0c589",
      "token": "declaration.tag.inline"
    },
    {
      "foreground": "e0c589",
      "token": "declaration.tag.inline entity"
    },
    {
      "foreground": "e0c589",
      "token": "source entity.name.tag"
    },
    {
      "foreground": "e0c589",
      "token": "source entity.other.attribute-name"
    },
    {
      "foreground": "e0c589",
      "token": "meta.tag.inline"
    },
    {
      "foreground": "e0c589",
      "token": "meta.tag.inline entity"
    },
    {
      "foreground": "cda869",
      "token": "meta.selector.css entity.name.tag"
    },
    {
      "foreground": "8f9d6a",
      "token": "meta.selector.css entity.other.attribute-name.tag.pseudo-class"
    },
    {
      "foreground": "8b98ab",
      "token": "meta.selector.css entity.other.attribute-name.id"
    },
    {
      "foreground": "9b703f",
      "token": "meta.selector.css entity.other.attribute-name.class"
    },
    {
      "foreground": "c5af75",
      "token": "support.type.property-name.css"
    },
    {
      "foreground": "f9ee98",
      "token": "meta.property-group support.constant.property-value.css"
    },
    {
      "foreground": "f9ee98",
      "token": "meta.property-value support.constant.property-value.css"
    },
    {
      "foreground": "8693a5",
      "token": "meta.preprocessor.at-rule keyword.control.at-rule"
    },
    {
      "foreground": "ca7840",
      "token": "meta.property-value support.constant.named-color.css"
    },
    {
      "foreground": "ca7840",
      "token": "meta.property-value constant"
    },
    {
      "foreground": "8f9d6a",
      "token": "meta.constructor.argument.css"
    },
    {
      "foreground": "f8f8f8",
      "background": "0e2231",
      "fontStyle": "italic",
      "token": "meta.diff"
    },
    {
      "foreground": "f8f8f8",
      "background": "0e2231",
      "fontStyle": "italic",
      "token": "meta.diff.header"
    },
    {
      "foreground": "f8f8f8",
      "background": "0e2231",
      "fontStyle": "italic",
      "token": "meta.separator"
    },
    {
      "foreground": "f8f8f8",
      "background": "420e09",
      "token": "markup.deleted"
    },
    {
      "foreground": "f8f8f8",
      "background": "4a410d",
      "token": "markup.changed"
    },
    {
      "foreground": "f8f8f8",
      "background": "253b22",
      "token": "markup.inserted"
    },
    {
      "foreground": "f9ee98",
      "token": "markup.list"
    },
    {
      "foreground": "cf6a4c",
      "token": "markup.heading"
    }
  ],
  "colors": {
    "editor.foreground": "#F8F8F8",
    "editor.background": "#141414",
    "editor.selectionBackground": "#DDF0FF33",
    "editor.lineHighlightBackground": "#FFFFFF08",
    "editorCursor.foreground": "#A7A7A7",
    "editorWhitespace.foreground": "#FFFFFF40"
  }
}



const App = () => {

  const { toast } = useToast()

  let editorRef = useRef(editor);

  function handleEditorDidMount(editor: any, monaco: Monaco) {
    editorRef.current = editor;

    monaco.editor.defineTheme('twilight', TwilightTheme);
    monaco.editor.setTheme('twilight');

    // import('monaco-themes/themes/Twilight.json')
    //   .then(data => {
    //     monaco.editor.defineTheme('twilight', data.default);
    //     monaco.editor.setTheme('twilight');
    //   })
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
