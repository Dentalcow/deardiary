'use client'

import Link from "next/link"
import React, { useRef, useEffect, useState } from "react";

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

import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { exit } from '@tauri-apps/api/process';
import { readDir, readTextFile } from '@tauri-apps/api/fs';
import { documentDir } from '@tauri-apps/api/path';

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Entry = {
  title: string;
  content: string;
  date: string;
}

let loadedFiles = false;

const viewerPage = () => {
  let fileRef = useRef([] as string[]);
  const [viewerContents, setViewerContents] = useState("# hello, please select item from left.");

  const getButtonsUsingMap = () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]

    return array.map((number) => {
      return <Button className="my-1 w-full" variant="secondary">{number}</Button>
    })
  }

  const { toast } = useToast()

  async function onExit() {
    await exit(0);
  }

  const loadViewer = (event) => {
    console.log(event.target.dataset.date)
    loadFiles();
    let entryFiles = fileRef.current;

    let entryContents;

    entryFiles.forEach(entry => {
      const entryObject = JSON.parse(entry);
      const date = entryObject.date;
      if (date == event.target.dataset.date) {
        entryContents = entryObject.content;
        setViewerContents(entryContents);
      }
    });
  }

  async function loadFiles() {
    if (loadedFiles === false) {
      loadedFiles = true;
      const documentDirPath = (await documentDir()).replace(/\\/g, '/');
      const dir = await readDir(documentDirPath + "deardiary/");
      const paths = [];
      for (let i = 0; i < dir.length; i++) {
        const path = dir[i].path;
        paths.push(path);
      }
      console.log(dir);
      console.log(paths);

      let files: string[];
      files = [];

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const file = await readTextFile(path);
        console.log(file);
        files.push(file);
        console.log(files);
      }

      toast({
        title: "Loaded files",
        description: "Check console for more info",
      })

      fileRef.current = files;
    }
  }

  function loadButtons() {
    loadFiles();
    let entryFiles;
    let datesArray = [];
    entryFiles = fileRef.current;
    for (let i = 0; i < entryFiles.length; i++) {
      const file = entryFiles[i];
      datesArray.push(JSON.parse(file).date);
    }

    return datesArray.map((date: string) => {
      return <Button className="my-1 w-full" data-date={date} variant="secondary" onClick={loadViewer}>{date}</Button>
    })
  }

  async function getEntryValue(path: string) {
    const file = await readTextFile(path);
    const parsedFile = JSON.parse(file);
    console.log(parsedFile.content);
    return (parsedFile.content);
  }

  function beforePageTravel() {
    loadedFiles = false;
  }

  return (
    <div>
      <div>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <button onClick={onExit}>Quit</button>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <button onClick={beforePageTravel}>
                  <Link href="/">Launch Editor</Link>
                </button>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Dev</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <button onClick={loadFiles}>
                  Load Files
                </button>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
      <div className="flex">
        <ScrollArea className="flex-intial gap-2 m-2 p-2 h-[93vh] w-48 rounded-md border">
          {loadButtons()}
        </ScrollArea>
        <ScrollArea className="flex-1 p-2 m-2 h-[93vh] rounded-md border prose-sm prose-invert">
          <ReactMarkdown className="markdowm" children={viewerContents} remarkPlugins={[remarkGfm]}/>
        </ScrollArea>
      </div>
    </div>
  );
};

export default viewerPage;