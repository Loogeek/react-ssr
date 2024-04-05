import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import { readdirSync } from "fs";
import { resolve, join } from "path";

const app = express();
app.use(express.static("public"));

const pagesDir = join(process.cwd(), "/pages");
const pages = readdirSync(pagesDir).map((pages) => pages.split(".")[0]);

app.get("/*", async (req, res) => {
  const page = req.path.split("/")[1] || "index";

  if (pages.includes(page)) {
    const file = await import(`./pages/${page}.jsx`);

    let propsObj = {};
    if (file.getServerSideProps) {
      const { props } = await file.getServerSideProps({ query: req.query });
      propsObj = props;
    }
    const Component = file.default;

    const content = renderToString(<Component {...propsObj} />);
    res.send(`
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
        <script src="/client.bundle.js"></script>
       </body>
    </html>
    `);
  } else {
    return res.status(200).json({ message: `${page} not found in ${pages}` });
  }
});

app.listen(3000, () => console.log("listening on port 3000!"));
