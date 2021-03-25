module.exports = {
    ensureAuthenticated: (request, response, next) => {
      if (request.isAuthenticated()) {
        return next()
      } else {
        
        response.redirect("/login")
      }
    },
  }