import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import { readdirSync, existsSync, mkdirSync, writeFileSync, stat } from "fs";
import { resolve, join } from "path";

const app = express();
const pagesDir = join(process.cwd(), "/pages");
const pages = readdirSync(pagesDir).map((pages) => pages.split(".")[0]);
const expireTime = 1000 * 10;

async function build() {
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
}

app.get(/.*$/, async (req, res) => {
  let page = req.path.split("/")[1];
  page = page ? page : "index";
  const htmlPath = join(process.cwd(), `output/${page}.html`);
  if (pages.includes(page)) {
    stat(htmlPath, async (err, state) => {
      if (err) {
        await build();
        return sendFile(page, res);
      }

      if (Date.now() - state.mtime > expireTime) {
        await build();
      }
      return sendFile(page, res);
    });
  } else {
    return res.status(200).json({ message: `${page} not found in ${pages}` });
  }
});

function sendFile(page, res) {
  return res.sendFile(join(process.cwd(), "output", page + ".html"));
}

app.listen(3000, () => console.log("Server is running in 3000"));
