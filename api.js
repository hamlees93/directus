/*
The way the app is setup at the moment, it will get all blogs, all the time. Then when it tries to post to directus is when the duplicates will be prevented from posting. Would be better if we could do some sort of check before sending the post request. Potentially a query on the end of the get request, to only get requests from the last x amount of time
*/

const axios = require('axios');
require("dotenv").config(); 

// Get all the blogs written by CoderAcademy
const getMediumFeed = async () =>  {
	try {
        // Worth noting that the rss is converted to json using the below link. If this breaks for whatever reason, there are lots of alternatives
        const response = await axios.get(`https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@coderacademy`);

        // If we want to post more data
        return response.data.items;

        // If we end up going down the route of only posting the URL
        // return response.data.items[0].guid;
	} catch (error) {
		console.error(error);
    }
}

// Post blog information to DIRECTUS
// Currently not the most efficient - but gets the job done. It will go through each blog and post them to directus. Directus is set up for only unique URLs, so will reject any duplication. This does however cause an issue, as if a blog is loaded into directus, then deleted, it can never be loaded back in
const postToDirectus = async (blogs) => {
    // Get the current bearer token
    const token = await getBearerToken();

    for (let blog of blogs) {
        try {
            const response = await axios.post(`${process.env.URL}/_/items/blog`, {
                title: blog.title,
                url: blog.guid,
                imageurl: blog.thumbnail,
                content: blog.content
            },
            {
                headers: {
                    "Authorization": `bearer ${token}`
                }
            })
            .then(response => console.log(response))
            .catch(error => console.log(error.response.statusText))
        } catch (error) {
            console.log(error);
        }
    }
}

// Function that sends admin details to DIRECTUS to get the current JWT
const getBearerToken = async () => {
    try {
        const response = await axios.post(`${process.env.URL}/_/auth/authenticate`, {
            email: process.env.DIRECTUS_EMAIL,
            password: process.env.DIRECTUS_PASSWORD
        });

        return response.data.data.token;

    } catch(error) {
        console.log(error)
    }
}

getMediumFeed().then(result => postToDirectus(result));