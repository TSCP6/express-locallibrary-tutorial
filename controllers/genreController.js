const Genre = require("../models/genre");
const asyncHandler = require("express-async-handler");
var Book = require("../models/book");
var async = require("async");
const book = require("../models/book");
const { body, validationResult } = require("express-validator");

// 显示所有的流派。
exports.genre_list = asyncHandler(async (req, res, next) => {
  const list_genres = await Genre.find().sort({ name: 1 }).exec();
  res.render("genre_list", {
    title: "Genre List",
    genre_list: list_genres,
  });
});

// 显示特定流派的详情页。
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const [genre, genre_books] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }).sort({ name: 1 }).exec(),
  ]);

  if (genre == null) {
    var err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }
  res.render("genre_detail", {
    title: "Genre Detail",
    genre: genre,
    genre_books: genre_books,
  });
});

// 通过 GET 显示创建流派。
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Create Genre" });
};

// 以 POST 方式处理创建流派。
exports.genre_create_post = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async(req,res,next)=>{
    const errors=validationResult(req);
    const genre=new Genre({name:req.body.name});
    if(!errors.isEmpty()){
      res.render("genre_form",{
        title:"Create Genre",
        genre:genre,
        errors:errors.array(),
      });
      return ;
    }
    else{
      const genreExists=await Genre.findOne({name:req.body.name})
      .collation({locale:"en",strength:2})
      .exec();
      if(genreExists){
        res.redirect(genreExists.url);
      }
      else{
        await genre.save();
        res.redirect(genre.url);
      }
    }
  })
];

// 通过 GET 显示流派删除表单。
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre,genres_books]=await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({genre:req.params.id}).exec(),
  ]);
  if(genre==null){
    res.redirect("/catalog/genres");
    return;
  }
  res.render("genre_delete",{
    title:"Delete Genre",
    genre:genre,
    genre_books:genres_books,
  });
});

// 处理 POST 时的流派删除。
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const[genre,genres_books]=await Promise.all([
    Genre.findById(req.body.genreid).exec(),
    Book.find({genre:req.body.genreid}).exec(),
  ]);
  if(genres_books.length>0){
    res.render("genre_delete",{
      title:"Delete Genre",
      genre:genre,
      genre_books:genres_books,
    });
    return;
  }else{
    await Genre.findByIdAndDelete(req.body.genreid);
    res.redirect("/catalog/genres");
  }
});

// 通过 GET 显示流派更新表单。
exports.genre_update_get = asyncHandler(async (req, res, next) => {
   const genre=await Genre.findById(req.params.id).exec();
   if(genre==null){
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
   }
   res.render("genre_form",{
    title:"Update Genre",
    genre:genre,
   });
});

// 处理 POST 上的流派更新。
exports.genre_update_post = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async(req,res,next)=>{
    const errors=validationResult(req);
    var genre=new Genre({
      name:req.body.name,
      _id:req.params.id,
    });
    if(!errors.isEmpty()){
      res.render("genre_form",{
        title:"Update Genre",
        genre:genre,
        errors:errors.array(),
      });
      return ;
    }
    else{
      const thegenre=await Genre.findByIdAndUpdate(req.params.id,genre,{});
      res.redirect(thegenre.url);
    }
  }),
];