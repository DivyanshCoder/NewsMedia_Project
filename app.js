const express = require("express");
const inshorts = require('inshorts-news-api');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require("body-parser");



//body parser
app.use(bodyParser.urlencoded({extended:true}));

//connecting to mongodb
mongoose.connect("mongodb+srv://ajaypatidar:ajay2112@cluster0.kwfo9wy.mongodb.net/?retryWrites=true&w=majority",{
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Successfully connect to MongoDB."))
.catch(err => console.error("Connection error", err));

const newsSchema = {
  newsOffset: String,
  newsData: [],
}

const newsDataSchema = {
  postNumber: Number,
  likes: Number,
  dislikes: Number,
  comments:[{
    username: String,
    content: String,
  }]
}

const newsOffsetSchema = {
  id: String,
  newsOffset:[],
}

const NewsOffsetArray = mongoose.model("NewsOffsetArray",newsOffsetSchema);

const News = mongoose.model("News",newsSchema);

const NewsData = mongoose.model("NewsData",newsDataSchema);


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

  
  inshorts.getNews(options , function(result, news_offset){
    // console.log(result);
    
    let postData ="";
    News.findOne({newsOffset: news_offset},function (err, res){
      if(err){
        console.log(err);
      }else{
        if(res==null){
          const newNews = new News({
            newsOffset: news_offset,
          });

          newNews.save(function(err){
            if(err){
              console.log(err);
            }else{
              console.log("saved securly");
            }
          });
          postData = newNews;
        }else{
          postData = res;
        }
        

      }
    });

    // //adding value to news offset aaray
    NewsOffsetArray.findOne({id:"ajaypatidar"},function(err,Arrayresult){
      if(err){
        console.log(err);
      }else{
        var flag= false;
        // console.log(Arrayresult.newsOffset);
        for(var i=0;i<Arrayresult.newsOffset.length;i++){
          if(Arrayresult.newsOffset[i] == news_offset){
            flag = true;
          }
        }

        if(!flag){
          // console.log(Arrayresult);
          NewsOffsetArray.updateOne({id:"ajaypatidar"},{$push:{newsOffset:news_offset}},
          function(err,upres){
              if(err){
                console.log(err);
              }else{
                // console.log(upres);
              }
          })
          // console.log("offset is added to array");
        }

      }
    })

    res.render("home", {
      posts: result,
      dataOffset: news_offset,
      postData:postData}
      );

    // console.log(news_offset);

  });
  
});


app.post('/liked',function(req,res){

  News.find({newsOffset: req.body.offset},function(err,news){
    if(err){
      console.log(err);
    }else{
      console.log(news);
      // if(news.newsData == null){
      //   console.log("creating a newsData")
      //   let newArray = {
      //     postNumber: req.body.number,
      //     likes:1,
      //     dislikes:0,
      //   }

      //   News.updateOne({id:req.body.offset},{$push:{newsData:newArray}},
      //     function(err,upres){
      //         if(err){
      //           console.log(err);
      //         }else{
      //           console.log(upres);
      //         }
      //     });
        
      // }else{
      //     for(let i = 0;i<news.newsData.length;i++){
      //       if(news.newsData[i].postNumber == req.body.number){
      //         news.newsData[i].likes++;
      //         console.log(news.newsData[i].likes);
      //         break;
      //       }
      //     }
      // }
    }
  })
  console.log(req.body);
  console.log("fetching ");
})


app.get('/register',function(req, res){
  res.sendFile(__dirname + "/views/register.html")
})

let port = 80;
app.listen(port, function() {
    console.log("http://localhost/");
  });