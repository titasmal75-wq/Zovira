exports.pageNotFound = (req, res, next) => {
  console.log("high")
  res
    .status(404)
    .render("404", { pageTitle: "Page Not Found", currentPage: "404" , isLoggedIn : req.isLoggedIn});
};


