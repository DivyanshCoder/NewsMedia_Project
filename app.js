const express = require("express");
const inshorts = require('inshorts-news-api');
const app = express();

const ejs = require("ejs");
app.set('view engine', 'ejs');
app.use(express.static("."));

app.use(express.static("public"));


//specify language, category of news you want
var options = {
  lang: 'en',
  category: ''  
}




app.get('/', (req, res) => {

  inshorts.getNews(options ,function(result, news_offset){
    // console.log(result);
    // console.log(news_offset);

    res.render("home", {
      // startingContent: homeStartingContent,
      posts: result,
      });

  });

  
  
})

let port = 80;
app.listen(port, function() {
    console.log("http://localhost/");
  });