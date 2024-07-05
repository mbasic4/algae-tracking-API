## Algae Tracking API

#### Objective:

An application used to monitor, observe and report algae pollution in water bodies accross USA, API built with Node, Typescript and Express framework.

#### Key notes:

- user will always see 20 bodies of water nearest to the map center. By dragging on the map 20 water bodies nearest to the current map center will be displayed.
- map defaults to New York for biologist, and for citizen-scientist it uses his/hers location depending on their address which is geocoded
- token refreshing has not been implemented, user gets an access token which is valid for 1h

## Installation and Setup Instructions  

Clone down this repository. You will need `node`, `npm`, `shp2pgsql` and `psql` installed globally on your machine. Instructions to start the client can be found here https://github.com/mbasic4/algae-tracking-client/blob/main/README.md

Installation:

`npm install`


To setup databases:

`docker-compose up`


To setup data:

`npm run migrate`

`npm run import-data`


To setup and run tests:

`npm run test`


To Start The App:

`npm start`


App will be running on:

`http://localhost:8080`  


## Project Screen Shot(s)   

<img width="1728" alt="Screenshot 2024-07-05 at 20 24 25" src="https://github.com/mbasic4/algae-tracking-API/assets/20629097/7acd2816-aa43-4a7c-83a5-552e3435e4fa">
