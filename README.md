# LinkedIn Job Postings Scrapper

## Endpoints
- `/keyword/:keyword/location/:location` - Starts a scrapp process, and returns the id and the url for the results 
- `/job-posting/:id.json` - Returns a json file with the results for the id provided


## Heroku

### Setup

1. Login to heroku `heroku login`
2. Clone repo `heroku git:clone -a linkedin-job-posting-scrapper`
3. Go to root folder `cd linkedin-job-posting-scrapper`
4. Install dependencies`npm install`
5. Start local server `heroku local web`

### Deploy

1. Stage and commit your code
2. Push to heroku remote `git push heroku master`
3. Visit deployment `heroku open`