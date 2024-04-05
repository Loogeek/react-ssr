import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import { readdirSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve, join } from "path";

const pagesDir = join(process.cwd(), "/pages");
const pages = readdirSync(pagesDir).map((pages) => pages.split(".")[0]);

if (!existsSync("output")) {
  mkdirSync("output");
}

pages.forEach(async (page) => {
  const file = await import(`./pages/${page}.jsx`);

  let propsObj = {};
  if (file.getServerSideProps) {
    const { props } = await file.getServerSideProps();
    propsObj = props;
  }
  const Component = file.default;

  const content = renderToString(<Component {...propsObj} />);
  writeFileSync(
    `output/${page}.html`,
    `
    <html>
       <head>
           <title>Tiny React SSR</title>
       </head>
       <body>
        <div id='root'>${content}</div>
        <script>
          window.__DATA__ = ${JSON.stringify({
            props: propsObj,
            page,
          })}
        </script>
        <script src="./public/build.bundle.js"></script>
       </body>
    </html>
    `
  );
});
