## How to start the app
```npm i```

```yarn start```

##### Start the server
```cd server```

```npm i```

```node server.js```

#### Running the automated tests
``cd server``

``npm test``

## What has been done

At the beginning of this task, I tried to connect directly from the UI to Starling Bank
API to fetch the accounts. However, I kept getting cors issues, which after few minutes
of googling around, I concluded that it was not possible to establish a connection from
the client side. Hence, I chose to have a server which sits between the UI and Starling
Bank API calls. I also created StarlingUtils which helped me to reuse code and make the
testing easier.

The server is test driven, meaning that each API call is automatically tested. This helped
me to be more confident when it came to finally plugging it to the frontend.

The frontend is built using React without Redux due to the fact that there aren't many
components therefore it would make sense to just use the state management that comes with 
react (useState). 

