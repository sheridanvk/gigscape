Welcome to Gigscape
=================

This is a simple map of concerts happening today, with links to the artists' music. Data is provided by Songkick and Spotify respectively. You can see the live version of this project at [https://gigsca.pe](https://gigsca.pe).

To run your own version of this, follow these steps:
- Create a netlify account at netlify.com
- Fork this repo, and then clone it onto your local machine, and change directories into it (`cd gigscape`)
- Log into the netlify account you just created, using `netlify login`
- Link your forked github repo to a new project on netlify
- Add the following environment variables into the project you just linked to on netlify.com:
    - SONGKICK_API_KEY
    - SPOTIFY_CLIENT_ID
    - SPOTIFY_CLIENT_SECRET
- Run `npm start dev`, or if you want to attach a debugger to the functions as you're developing them, use `npm run debug`.