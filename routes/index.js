var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req,res)=>{
  res.redirect("/catalog");//redirect使路由器重定向，默认发出"302 Found"
});

module.exports = router;
