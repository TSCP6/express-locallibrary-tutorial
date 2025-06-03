const Author = require("../models/author");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.author_list = asyncHandler(async (req, res, next) => {
  const list_authors = await Author.find().sort({ family_name: 1 }).exec();
  res.render("author_list", {
    title: "Author List",
    author_list: list_authors,
  });
});

exports.author_detail = asyncHandler(async (req, res, next) => {
  const [author, allBookByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);
  if (author == null) {
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }
  res.render("author_detail", {
    title: "Author Detail",
    author: author,
    author_books: allBookByAuthor,
  });
});

exports.author_create_get = (req, res, next) => {
  res.render("author_form", { title: "Create Author" });
};

exports.author_create_post = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });
    if (!errors.isEmpty()) {
      res.render("author_form", {
        title: "Create Author",
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      await author.save();
      res.redirect(author.url);
    }
  }),
];

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  const [author, authors_books] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }).exec(),
  ]);
  if (author == null) {
    // No results.
    res.redirect("/catalog/authors");
    return;
  }
  // Successful, so render.
  res.render("author_delete", {
    title: "Delete Author",
    author: author,
    author_books: authors_books,
  });
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  const [author, authors_books] = await Promise.all([
    Author.findById(req.body.authorid).exec(),
    Book.find({ author: req.body.authorid }).exec(),
  ]);
  if (authors_books.length > 0) {
    // Author has books. Render in same way as for GET route.
    res.render("author_delete", {
      title: "Delete Author",
      author: author,
      author_books: authors_books,
    });
    return;
  } else {
    // Author has no books. Delete object and redirect to the list of authors.
    await Author.findByIdAndDelete(req.body.authorid);
    // Success - go to author list
    res.redirect("/catalog/authors");
  }
});

exports.author_update_get = asyncHandler(async (req, res, next) => {
  const author = await Author.findById(req.params.id).exec();
  if (author == null) {
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }
  res.render("author_form", {
    title: "Update Author",
    author: author,
  });
});

exports.author_update_post = [
  body("first_name", "Firstname must not be empty.")
    .isLength({ min: 1 })
    .trim()
    .escape(),
  body("family_name","Familyname must not be empty.")
    .isLength({ min: 1 })
    .trim()
    .escape(),
  body("data_of_birth","Invalid date of birth.")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("date_of_death","Invalid date of death.")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  asyncHandler(async(req,res,next)=>{
    const errors=validationResult(req);
    var author=new Author({
      first_name:req.body.first_name,
      family_name:req.body.family_name,
      date_of_death:req.body.date_of_death,
      date_of_birth:req.body.date_of_birth,
      _id:req.params.id,
    });
    if(!errors.isEmpty()){
      res.render("author_form",{
        title:"Update Author",
        author:author,
        errors:errors.array(),
      });
      return;
    }else{
      const theauthor=await Author.findByIdAndUpdate(req.params.id,author,{});
      res.redirect(theauthor.url);
    }
  }),
];
