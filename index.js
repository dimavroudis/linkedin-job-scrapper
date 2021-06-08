const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const fs = require("fs");
const scrollPageToBottom = require("./scrollToBottom");
const { load } = require("cheerio");

const url =
  "https://www.linkedin.com/jobs/search/?keywords=Software%20Developer&location=Athens%2C%20Attiki%2C%20Greece&locationId=&geoId=103077496&sortBy=R&f_TPR=&distance=10&position=1&pageNum=0";

const scrollToEndoResults = async (page) => {
  await scrollPageToBottom(page);
  const loadMoreBtn = await page.$(".infinite-scroller__show-more-button")
  if (loadMoreBtn !== null) {
    await loadMoreBtn.evaluate( loadMoreBtn => loadMoreBtn.click() );
    return await scrollToEndoResults(page);
  }else{
    return page;
  }
};

puppeteer
  .launch({
    headless: false,
  })
  .then((browser) => browser.newPage())
  .then((page) => {
    return page
      .goto(url)
      .then(async function () {
        return await scrollToEndoResults(page);
      })
      .then(function () {
        return page.content();
      });
  })
  .then((html) => {
    const $ = cheerio.load(html);
    const jobPostings = [];
    $(".jobs-search__results-list li").each(function () {
      jobPostings.push({
        title: ($(this).find("h3.base-search-card__title").text() || "")
          .replace(/(\r\n|\n|\r)/gm, "")
          .trim(),
        companyName: ($(this).find("a.job-search-card__subtitle").text() || "")
          .replace(/(\r\n|\n|\r)/gm, "")
          .trim(),
        location: ($(this).find(".job-search-card__location").text() || "")
          .replace(/(\r\n|\n|\r)/gm, "")
          .trim(),
        createdAt: (
          $(this).find(".job-search-card__listdate--new").attr("datetime") || ""
        )
          .replace(/(\r\n|\n|\r)/gm, "")
          .trim(),
      });
    });

    let data = JSON.stringify(jobPostings);
    fs.writeFileSync("jobPostings.json", data);
    console.log("jobPostings", jobPostings.length);

    process.exit(0);
  })
  .catch(console.error);
