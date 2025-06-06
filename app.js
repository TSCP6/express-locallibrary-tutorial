var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter=require("./routes/catalog");
var compression=require('compression');
var helmet=require('helmet');

var app = express();

app.use(helmet());

const mongoose =require("mongoose");

const mongoDB=process.env.MONGODB_URI||"mongodb://root:7c2sx2p2@dbconn.sealosbja.site:35198/?directConnection=true";
mongoose.connect(mongoDB,{useNewUrlParser:true,useUnifiedTopology:true});
mongoose.Promise=global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB 连接错误: "));
db.once("open", function () {
  console.log("MongoDB 连接成功！");
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/catalog",catalogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
