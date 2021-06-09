/**
 * Scrolling page to bottom based on Body element
 * @param {Object} page Puppeteer page object
 */
 async function scrollPageToBottom(page){
  await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
          var totalHeight = 0;
          var distance = 400;
          var timer = setInterval(() => {
              var scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if(totalHeight >= scrollHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 600);
      });
  });
}

module.exports = scrollPageToBottom;
