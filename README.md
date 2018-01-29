# TinyApp Project

TinyAPp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly)

## Final Product
!["Landing page when localhost is called"](https://github.com/hvdson/tinyapp/blob/master/docs/home.png)
!["If the user isn't logged in they are redirected to the login page"](https://github.com/hvdson/tinyapp/blob/master/docs/login.png)
!["User is directed to corresponding http cat if any form is entered incorrectly"](https://github.com/hvdson/tinyapp/blob/master/docs/error.png)
!["register screen"](https://github.com/hvdson/tinyapp/blob/master/docs/register.png)
!["An example of a newly registred user"](https://github.com/hvdson/tinyapp/blob/master/docs/newregister.png)
!["adding a new url - the site is able to handle incorrect url links and append http:// if just the domain is given"](https://github.com/hvdson/tinyapp/blob/master/docs/newurl.png)
!["Showing the newly created TinyURL"](https://github.com/hvdson/tinyapp/blob/master/docs/showurl.png)
!["The update input field is able to handle incorrect url links as well"](https://github.com/hvdson/tinyapp/blob/master/docs/badurlupdate.png)
!["Shows http cat for invalid updates"](https://github.com/hvdson/tinyapp/blob/master/docs/updateurlerror.png)
!["We've added a couple of new urls"](https://github.com/hvdson/tinyapp/blob/master/docs/exampleurls.png)
!["This is after the urls have been deleted"](https://github.com/hvdson/tinyapp/blob/master/docs/deleteurls.png)

- Both login & register have an extra password field for the user to confirm their password.
- New URLs and Update URL fields are able to handle URLs in the form of *example.com* and *http(s)://example.com*
- The server prepends the *https://* protocol automatically if just the simple domain is given.
- HTTP cats for every error! :)
- Added extra styling

## Depenpencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started
- Insatall all dependencies (using the npm install command)
- run the development web server using the "node express_server.js" command
- Once the server is running, in the address bar of your web client, enter "http://localhost:8080" to view the web page.


