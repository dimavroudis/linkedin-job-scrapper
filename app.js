const express = require("express");
const scrap = require("./scrapper");

const port = 3200;
const staticOptions = {
  dotfiles: "ignore",
  etag: true,
  extensions: ["json"],
  index: false,
  maxAge: "1d",
  redirect: false,
};

// Start app
const app = express();

// Start a scrap process and return id and url for the results
app.get("/keyword/:keyword/location/:location", (req, res) => {
  let hash = scrap(req.params.keyword, req.params.location);
  res.json({ id: hash, url: `http://localhost:${port}/job-postings/${hash}.json` });
});

// Return the results of a scrap process  when complete
app.use("/job-postings", express.static("jobPostings", staticOptions));

app.listen(port, () => {
  // Server running...
  console.log(`Server running at http://localhost:${port}`);
});
