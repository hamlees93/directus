/*
Current Setup of App:
It will make a call to directus, to pull all alumni that have been entered. It will send this response to medium to get the rss feed of ALL blogs written by ALL alumni. This will go through a converter to get it to JSON. These blogs will then be posted to the directus blogs collection. Before posting, a check will be made to ensure the categories array is not empty. If it is empty, it is a comment.
*/

/*************************
 * NOTE: AT THE MOMENT, IT SEEMS WE CAN ONLY MAKE 10 REQUESTS!
 */

const axios = require('axios');
require("dotenv").config(); 

// Get all alumni that have been entered into directus. Must make a token call first
const getCoderAlumni = async () => {
    const token = await getBearerToken();

    try {
        const response = await axios.get(`${process.env.URL}/_/items/alumni?fields=username`, {
            headers: {
                "Authorization": `bearer ${token}`
            }
        });

        return response.data.data;
    } catch (error) {
        console.log(error);
    }
}

// Get all the blogs written by CoderAcademy
const getMediumFeed = async (coder) =>  {
    const blogs = [];
    
    for (let dev of coder) {
        try {
            // Worth noting that the rss is converted to json using the below link. If this breaks for whatever reason, there are lots of alternatives
            const response = await axios.get(`https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/${dev.username}`);

            blogs.push(response.data.items);
        } catch (error) {
            console.log(error.response.config.url);
            console.log(error.response.statusText);
        }
    }
    
    return blogs
}

// Post blog information to DIRECTUS
// Currently not the most efficient - but gets the job done. It will go through each blog and post them to directus. Directus is set up for only unique URLs, so will reject any duplication. This does however cause an issue, as if a blog is loaded into directus, then deleted, it can never be loaded back in
const postToDirectus = async (coder) => {
    // Get the current bearer token
    const token = await getBearerToken();

    for (let dev of coder) {
        for (let blog of dev) {
            if (blog.categories.length > 0) {
                try {
                    const response = await axios.post(`${process.env.URL}/_/items/blog`, {
                        title: blog.title,
                        url: blog.guid,
                        imageurl: blog.thumbnail,
                        content: blog.content,
                        author: blog.author,
                        pubdate: blog.pubDate.split(' ')[0] 
                    },
                    {
                        headers: {
                            "Authorization": `bearer ${token}`
                        }
                    })
                    .then(response => console.log(response.statusText))
                    .catch(error => console.log(error.response.statusText))
                } catch (error) {
                    console.log(error);
                }
            }
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

getCoderAlumni()
    .then(result => getMediumFeed(result)
    .then(result => postToDirectus(result)));