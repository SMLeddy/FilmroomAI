import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { GlobalContextProviders } from "./components/_globalContextProviders";
import Page_0 from "./pages/clips.tsx";
import PageLayout_0 from "./pages/clips.pageLayout.tsx";
import Page_1 from "./pages/_index.tsx";
import PageLayout_1 from "./pages/_index.pageLayout.tsx";
import Page_2 from "./pages/reports.tsx";
import PageLayout_2 from "./pages/reports.pageLayout.tsx";
import Page_3 from "./pages/analysis.tsx";
import PageLayout_3 from "./pages/analysis.pageLayout.tsx";
import Page_4 from "./pages/dashboard.tsx";
import PageLayout_4 from "./pages/dashboard.pageLayout.tsx";
import Page_5 from "./pages/libraries.tsx";
import PageLayout_5 from "./pages/libraries.pageLayout.tsx";
import Page_6 from "./pages/upload-film.tsx";
import PageLayout_6 from "./pages/upload-film.pageLayout.tsx";
import Page_7 from "./pages/games.$gameId.tsx";
import PageLayout_7 from "./pages/games.$gameId.pageLayout.tsx";
import Page_8 from "./pages/shared.$shareId.tsx";
import PageLayout_8 from "./pages/shared.$shareId.pageLayout.tsx";
import Page_9 from "./pages/reports.$reportId.tsx";
import PageLayout_9 from "./pages/reports.$reportId.pageLayout.tsx";
import Page_10 from "./pages/analysis.$opponent.tsx";
import PageLayout_10 from "./pages/analysis.$opponent.pageLayout.tsx";

if (!window.requestIdleCallback) {
  window.requestIdleCallback = (cb) => {
    setTimeout(cb, 1);
  };
}

import "./base.css";

const fileNameToRoute = new Map([["./pages/clips.tsx","/clips"],["./pages/_index.tsx","/"],["./pages/reports.tsx","/reports"],["./pages/analysis.tsx","/analysis"],["./pages/dashboard.tsx","/dashboard"],["./pages/libraries.tsx","/libraries"],["./pages/upload-film.tsx","/upload-film"],["./pages/games.$gameId.tsx","/games/:gameId"],["./pages/shared.$shareId.tsx","/shared/:shareId"],["./pages/reports.$reportId.tsx","/reports/:reportId"],["./pages/analysis.$opponent.tsx","/analysis/:opponent"]]);
const fileNameToComponent = new Map([
    ["./pages/clips.tsx", Page_0],
["./pages/_index.tsx", Page_1],
["./pages/reports.tsx", Page_2],
["./pages/analysis.tsx", Page_3],
["./pages/dashboard.tsx", Page_4],
["./pages/libraries.tsx", Page_5],
["./pages/upload-film.tsx", Page_6],
["./pages/games.$gameId.tsx", Page_7],
["./pages/shared.$shareId.tsx", Page_8],
["./pages/reports.$reportId.tsx", Page_9],
["./pages/analysis.$opponent.tsx", Page_10],
  ]);

function makePageRoute(filename: string) {
  const Component = fileNameToComponent.get(filename);
  return <Component />;
}

function toElement({
  trie,
  fileNameToRoute,
  makePageRoute,
}: {
  trie: LayoutTrie;
  fileNameToRoute: Map<string, string>;
  makePageRoute: (filename: string) => React.ReactNode;
}) {
  return [
    ...trie.topLevel.map((filename) => (
      <Route
        key={fileNameToRoute.get(filename)}
        path={fileNameToRoute.get(filename)}
        element={makePageRoute(filename)}
      />
    )),
    ...Array.from(trie.trie.entries()).map(([Component, child], index) => (
      <Route
        key={index}
        element={
          <Component>
            <Outlet />
          </Component>
        }
      >
        {toElement({ trie: child, fileNameToRoute, makePageRoute })}
      </Route>
    )),
  ];
}

type LayoutTrieNode = Map<
  React.ComponentType<{ children: React.ReactNode }>,
  LayoutTrie
>;
type LayoutTrie = { topLevel: string[]; trie: LayoutTrieNode };
function buildLayoutTrie(layouts: {
  [fileName: string]: React.ComponentType<{ children: React.ReactNode }>[];
}): LayoutTrie {
  const result: LayoutTrie = { topLevel: [], trie: new Map() };
  Object.entries(layouts).forEach(([fileName, components]) => {
    let cur: LayoutTrie = result;
    for (const component of components) {
      if (!cur.trie.has(component)) {
        cur.trie.set(component, {
          topLevel: [],
          trie: new Map(),
        });
      }
      cur = cur.trie.get(component)!;
    }
    cur.topLevel.push(fileName);
  });
  return result;
}

function NotFound() {
  return (
    <div>
      <h1>Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <p>Go back to the <a href="/" style={{ color: 'blue' }}>home page</a>.</p>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <GlobalContextProviders>
        <Routes>
          {toElement({ trie: buildLayoutTrie({
"./pages/clips.tsx": PageLayout_0,
"./pages/_index.tsx": PageLayout_1,
"./pages/reports.tsx": PageLayout_2,
"./pages/analysis.tsx": PageLayout_3,
"./pages/dashboard.tsx": PageLayout_4,
"./pages/libraries.tsx": PageLayout_5,
"./pages/upload-film.tsx": PageLayout_6,
"./pages/games.$gameId.tsx": PageLayout_7,
"./pages/shared.$shareId.tsx": PageLayout_8,
"./pages/reports.$reportId.tsx": PageLayout_9,
"./pages/analysis.$opponent.tsx": PageLayout_10,
}), fileNameToRoute, makePageRoute })} 
          <Route path="*" element={<NotFound />} />
        </Routes>
      </GlobalContextProviders>
    </BrowserRouter>
  );
}
