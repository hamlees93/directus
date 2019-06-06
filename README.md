# Medium Middleware

#### Purpose

A Microservice, built using NodeJS. This service will eventually put out an API call every 'X' amount of minutes to Medium to get all Coder Academy's blogs.

The service will then post those blogs to directus, acting as a headless CMS

#### Future plans

Eventually, the microservice will be able to see what blogs it has already passed to directus to become more efficient

#### Usage

1. git clone the repo
`git clone https://github.com/hamlees93/directus`
2. change into the repo directory
`cd directus`
3. install all dependencies
`npm install`
4. run the microservice using node
`node api.js`