const fs = require("fs");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const hashString = require("string-hash-64");
const scrollPageToBottom = require("./inc/scrollToBottom");

const DIRECTORY = "./jobPostings";
const BASEURL = "https://www.linkedin.com/jobs/search/";
const DISTANCE = "10";

const scrollToEnd = async (page) => {
  await scrollPageToBottom(page);
  const loadMoreBtn = await page.$(
    ".infinite-scroller__show-more-button--visible"
  );
  if (loadMoreBtn !== null) {
    await page
      .click(".infinite-scroller__show-more-button")
      .catch((err) => true);
    return await scrollToEnd(page);
  } else {
    return page;
  }
};

function cleanString(string) {
  if (!string) {
    return "";
  }
  return string.replace(/(\r\n|\n|\r)/gm, "").trim();
}

function queueJob(keyword, location) {
  const hash = hashString(keyword + "/" + location);
  scrapper(keyword, location, hash);
  return hash;
}

async function scrapper(keyword, location, hash) {
  const filePath = `${DIRECTORY}/${hash}.json`;
  const jobPostings = [];
  const startedAt = new Date().getTime();

  const url = encodeURI(
    `${BASEURL}?keywords=${keyword}&location=${location}&distance=${DISTANCE}`
  );

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
      height: 1200,
      width: 800,
    },
  });

  const page = await browser.newPage();

  await page.goto(url);
  await page.setViewport({
    width: 800,
    height: 1200
  });

  await scrollToEnd(page);
  const html = await page.content();

  const $ = cheerio.load(html);

  $(".jobs-search__results-list li").each(function () {
    jobPostings.push({
      title: cleanString($(this).find("h3.base-search-card__title").text()),
      companyName: cleanString(
        $(this).find("a.job-search-card__subtitle").text()
      ),
      location: cleanString($(this).find(".job-search-card__location").text()),
      createdAt: cleanString(
        $(this).find(".job-search-card__listdate--new").attr("datetime")
      ),
    });
  });
  const endedAt = new Date().getTime();

  // Write Ouput
  if (!fs.existsSync(DIRECTORY)) {
    fs.mkdirSync(DIRECTORY);
  }
  let data = JSON.stringify({
    jobPostings,
    metatada: {
      keyword,
      location,
      DISTANCE,
      startedAt,
      endedAt,
      length: jobPostings.length,
    },
  });
  fs.writeFileSync(filePath, data);

  console.log("LinkedIn:", url);
  console.log("Found Job Postings:", jobPostings.length);
  console.log("Outputs:", filePath);
}

module.exports = queueJob;
