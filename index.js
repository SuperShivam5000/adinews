const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const marked = require("marked").marked;

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const prepareNewsPrompt = require('./functions/prepareNewsPrompt.js');

app.get('/', (req, res) => {
  res.render("home", { title: "Home" });
});

app.post('/topheadlines', (req, res) => {
  newsapi.v2.topHeadlines({
    language: 'en'
  }).then(async news => {
    if(news.totalResults == 0) res.render("response", { formattedNews: "No relevant articles found.", title: "Top Headlines" });
    else {
      const prompt = "Organize and elaborate these news. Combine news from all available sources to eliminate bias, if multiple sources are available. Everything must be in it's source language. " + prepareNewsPrompt(news);
      const newsSummary = await model.generateContent(prompt);
      const formattedNews = marked(newsSummary.response.text());
      res.render("response", { formattedNews: formattedNews, title: "Top Headlines" });
    }
  });
});

app.post('/newsfinder', (req, res) => {
  var { query, source, language, from, to } = req.body;
  newsapi.v2.everything({
    q: query,
    source: source,
    language: language,
    from: from,
    to: to
  }).then(async news => {
    if(news.totalResults == 0) res.render("response", { formattedNews: "No relevant articles found.", title: "News Finder" });
    else {
      const prompt = "Organize and elaborate these news. Combine news from all available sources to eliminate bias, if multiple sources are available. Everything must be in it's source language. " + prepareNewsPrompt(news);
      const newsSummary = await model.generateContent(prompt);
      const formattedNews = marked(newsSummary.response.text());
      res.render("response", { formattedNews: formattedNews, title: "News Finder" });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));