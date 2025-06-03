var Book = require("../models/book");
const bookinstance = require("../models/bookinstance");
const BookInstance = require("../models/bookinstance");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { book_list } = require("./bookController");

// 显示所有的 BookInstances
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate("book").exec();

  res.render("bookinstance_list", {
    title: "Book Instance List",
    bookinstance_list: allBookInstances,
  });
});

// 显示特定 BookInstance 的详情页
// 展示特定 BookInstance 的详情页。
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookInstance === null) {
    // 没有结果。
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  res.render("bookinstance_detail", {
    title: "Book:",
    bookinstance: bookInstance,
  });
});

// 由 GET 显示创建 BookInstance 的表单
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const books = await Book.find({}, "title").exec();
  res.render("bookinstance_form", {
    title: "Create BookInstance",
    book_list: books,
  });
});

// 由 POST 处理创建 BookInstance
exports.bookinstance_create_post = [
  // Validate fields.
  body("book", "Book must be specified").isLength({ min: 1 }).trim().escape(),
  body("imprint", "Imprint must be specified")
    .isLength({ min: 1 })
    .trim()
    .escape(),
  body("status").trim().escape(),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // Create a BookInstance object with escaped and trimmed data.
    var bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      const books = await Book.find({}, "title").exec();
      res.render("bookinstance_form", {
        title: "Create BookInstance",
        book_list: books,
        selected_book: bookinstance.book,
        errors: errors.array(),
        bookinstance: bookinstance,
      });
      return;
    } else {
      // Data from form is valid.
      await bookinstance.save();
      // Successful - redirect to new record.
      res.redirect(bookinstance.url);
    }
  }),
];

// 由 GET 显示删除 BookInstance 的表单
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookinstances_books = await BookInstance.find({
    bookinstances_books: req.params.id,
  }).exec();
  if (bookinstances_books == null) {
    res.redirect("/catalog/bookinstances");
    return;
  }
  res.render("bookinstance_delete", {
    title: "Delete BookInstance",
    bookinstance: bookinstances_books,
  });
});

// 由 POST 删除 BookInstance
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  const bookinstances_books = await BookInstance.find({
    bookinstances_books: req.body.bookinstanceid,
  }).exec();
  await BookInstance.findByIdAndDelete(req.body.bookinstanceid);
  res.redirect("/catalog/bookinstances");
});

// 由 GET 显示更新 BookInstance 的表单
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  const [bookInstance, books] = await Promise.all([
    BookInstance.findById(req.params.id).populate("book").exec(),
    Book.find().exec(),
  ]);
  if (bookInstance == null) {
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }
  res.render("bookinstance_form", {
    title: "Update BookInstance",
    book_list: books,
    selected_book: bookInstance.book,
    bookinstance: bookInstance,
  });
});

// 由 POST 处理更新 BookInstance
exports.bookinstance_update_post = [
  body("book", "Book must be specified").isLength({ min: 1 }).trim().escape(),
  body("imprint", "Imprint must be specified")
    .isLength({ min: 1 })
    .trim()
    .escape(),
  body("status").trim().escape(),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  asyncHandler(async(req,res,next)=>{
    const errors=validationResult(req);
    var bookinstance=new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id:req.params.id,
    });
    if (!errors.isEmpty()) {
      const books = await Book.find({}, "title").exec();
      res.render("bookinstance_form", {
        title: "Update BookInstance",
        book_list: books,
        selected_book: bookinstance.book,
        errors: errors.array(),
        bookinstance: bookinstance,
      });
      return;
    } else{
      const theinstance=await BookInstance.findByIdAndUpdate(req.params.id,bookinstance,{});
      res.redirect(theinstance.url);
    }
  }),
];
