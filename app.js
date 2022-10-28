const express = require("express");
const inshorts = require('inshorts-news-api');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
var Schema = mongoose.Schema;

const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');

let index = 0;
let boolean = false;

//body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


//initializing passport js

app.use(session({
  secret: 'oh my little dirty secret',
  resave: false,
  saveUninitialized: true,

}));

app.use(passport.initialize());
app.use(passport.session());

//connecting to mongodb
mongoose.connect("mongodb+srv://ajaypatidar:ajay2112@cluster0.kwfo9wy.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("Successfully connect to MongoDB."))
  .catch(err => console.error("Connection error", err));

const newsSchema = new Schema({
  newsOffset: String,
  date: { type: Date, default: Date.now },
  postNumber: Number,
  likes: Number,
  dislikes: Number,
  comments: [],
  title: String,
  image: String,
  content: String,
  postedAt: String,
  readMore: String,

});

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
})

UserSchema.plugin(passportLocalMongoose);

const newsOffsetSchema = {
  id: String,
  newsOffset: [],
}
const NewsOffsetArray = mongoose.model("NewsOffsetArray", newsOffsetSchema);

const News = mongoose.model("News", newsSchema);

const User = mongoose.model("User", UserSchema);

newsSchema.index({ "date": 1 }, { expireAfterSeconds: 86400 });

passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
  done(null, user.id);
  // where is this user.id going? Are we supposed to access this anywhere?
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});


// const ejs = require("ejs");
app.set('view engine', 'ejs');
app.use(express.static("."));

app.use(express.static("public"));


//specify language, category of news you want
var options = {
  lang: 'en',
  category: ''
}





app.get('/', (req, res) => {


  inshorts.getNews(options, function (result, news_offset) {


    News.find({ newsOffset: news_offset }, function (err, res) {
      if (err) {
        console.log(err);
      } else {
        console.log(res.length);
        if (res.length == 0) {
          for (let i = 0; i < 25; i++) {
            const newNews = new News({
              newsOffset: news_offset,
              postNumber: i + 1,
              likes: 0,
              dislikes: 0,
              comments: [],
              title: result[i].title,
              content: result[i].content,
              postedAt: result[i].postedAt,
              readMore: result[i].readMore,
              image: result[i].image,
            })

            newNews.save(function (err) {
              if (err) {
                console.log(err);
              } else {
                console.log("saved securly");
              }
            });
          }
        }
      }
    });

    // //adding value to news offset aaray
    NewsOffsetArray.findOne({ id: "ajaypatidar" }, function (err, Arrayresult) {
      if (err) {
        console.log(err);
      } else {
        let flag = false;
        // console.log(Arrayresult.newsOffset);
        for (var i = 0; i < Arrayresult.newsOffset.length; i++) {
          if (Arrayresult.newsOffset[i] == news_offset) {
            flag = true;
          }
        }

        if (!flag) {
          // console.log(Arrayresult);
          NewsOffsetArray.updateOne({ id: "ajaypatidar" }, { $push: { newsOffset: news_offset } },
            function (err, upres) {
              if (err) {
                console.log(err);
              } else {
                // console.log(upres);
              }
            })
          // console.log("offset is added to array");
        }

      }
    });


    res.render("home", {
      posts: result,
      dataOffset: news_offset
    }
    );

    // console.log(news_offset);

  });

});



app.get('/:number/:offset', function (req, res) {

  if (req.isAuthenticated()) {

    console.log(req.params.offset, req.params.number);
    let number = req.params.number;
    let offset = req.params.offset;
    News.findOne({ newsOffset: offset, postNumber: number }, function (err, news) {
      if (err) {
        console.log(err);
      } else {
        console.log(news);
        res.render('newPost', { post: news });
      }
    })

  } else {
    res.redirect('/register');
  }



})


//liked updation

app.post('/liked', function (req, res) {
  let offset = req.body.offset;
  let likes = req.body.likes;
  let postNumber = req.body.number;

  News.findOneAndUpdate({ newsOffset: offset, postNumber: postNumber }, { $set: { likes: likes } }, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      // console.log(doc);
    }
  })
});

//disliked

app.post('/disliked', function (req, res) {
  let offset = req.body.offset;
  let likes = req.body.likes;
  let postNumber = req.body.number;

  News.findOneAndUpdate({ newsOffset: offset, postNumber: postNumber }, { $set: { dislikes: likes } }, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      // console.log(doc);
    }
  })
});


app.post('/comment', function (req, res) {
  let newsOffset = req.body.newsOffset;
  let postNumber = req.body.number;
  let comment = req.body.comment;
  console.log(newsOffset, postNumber, comment);
  News.updateOne({ newsOffset: newsOffset, postNumber: postNumber },
    { $push: { "comments": comment } }, function (err, news) {
      if (err) {
        console.log(err);
      } else {
        console.log(news);
        console.log("comment is update")
      }
    })
});


app.get('/newNews/getMore/:newsOffset', function (req, res) {
  let newsOffset = req.params.newsOffset


  NewsOffsetArray.find({ id: "ajaypatidar" }, function (err, rest) {

    if (err) {
      console.log(err);
    } else {
      console.log("more value");

      let result = JSON.stringify(rest);

      let object = JSON.parse(result);
      // console.log(object[0]['newsOffset'].length);

      if (!boolean) {
        index = object[0]['newsOffset'].length - 1;
        boolean = true;
      }

      console.log(index);
      index = index - 1;

      console.log(object[0]['newsOffset'][index]);
      // console.log(prev + "previous index");

      let options = {
        lang: 'en',
        category: "",
        news_offset: object[0]['newsOffset'][index],
      }

      inshorts.getMoreNews(options, function (result, news_offset) {
        res.render("getMoreHome", {
          posts: result,
          dataOffset: news_offset
        }
        );
      });
    }

  })

});

// implemeting diffetent category

app.get('/news/category/:cat', function (req, res) {
  let cat = req.params.cat;
  console.log(cat);
  let options = {
    lang: 'en',
    category: cat,
  }

  inshorts.getNews(options, function (result, news_offset) {

    News.find({ newsOffset: news_offset }, function (err, res) {
      if (err) {
        console.log(err);
      } else {
        console.log(res.length);
        if (res.length == 0) {
          for (let i = 0; i < 25; i++) {
            const newNews = new News({
              newsOffset: news_offset,
              postNumber: i + 1,
              likes: 0,
              dislikes: 0,
              comments: [],
              title: result[i].title,
              content: result[i].content,
              postedAt: result[i].postedAt,
              readMore: result[i].readMore,
              image: result[i].image,
            })

            newNews.save(function (err) {
              if (err) {
                console.log(err);
              } else {
                console.log("saved securly");
              }
            });
          }
        }
      }
    });

    // console.log(result);
    res.render("catagory", {
      posts: result,
      dataOffset: news_offset
    }
    );


  });
})


app.get('/register', function (req, res) {
  res.sendFile(__dirname + "/views/register.html")
})

app.get('/navbar', function (req, res) {
  res.sendFile(__dirname + "/views/navbar.html")
})


app.get('/about', function (req, res) {
  res.render("about");
})

//login and register post routes
app.post('/register', (req, res) => {
  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect('/register');
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      })
    }
  });

});

app.post('/login', (req, res) => {

  const user = new User({
    email: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      })
    }
  })

});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 80;
}
app.listen(port, function () {
  console.log("Server is Started succesfully");
}); 