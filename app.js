const express = require("express");
const scrap = require("./scrapper");
const helmet = require('helmet');
const compression = require('compression');

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

app.use(helmet()); // Protect from well-known web vulnerabilities 

app.use(compression()); //Compress all routes

// Return Endpoints index
app.get("/", (req, res) => {
  res.json({
    name: "LinkedIn Job Postings Scrapper",
    routes: app._router.stack.filter(r => r.route).map(r => ({path : r.route.path, keys: r.keys, methods: r.route.methods}))
  });
});

// Start a scrap process and return id and url for the results
app.get("/keyword/:keyword/location/:location", (req, res) => {
  let hash = scrap(req.params.keyword, req.params.location);
  res.json({ id: hash, url: `http://${req.hostname}:${port}/job-postings/${hash}.json` });
});

// Return the results of a scrap process  when complete
app.use("/job-postings", express.static("jobPostings", staticOptions));

// Custom Error Handling
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(port, () => {
  // Server running...
  console.log(`Server running at http://localhost:${port}`);
});
