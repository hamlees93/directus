const axios = require('axios');
require("dotenv").config(); 

// Get all the blogs written by CoderAcademy
const getMediumFeed = async () =>  {
	try {
        const response = await axios.get(`https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@coderacademy`);

        // If we want to post more data
        return response.data.items[0];

        // If we end up going down the route of only posting the URL
        // return response.data.items[0].guid;
	} catch (error) {
		console.error(error);
    }
}

// Post blog information to DIRECTUS
const postToDirectus = async (blog) => {
    // Get the current bearer token
    const token = await getBearerToken();
    
    try {
        const response = await axios.post('http://localhost:8888/_/items/blog', {
            title: blog.title,
            status: "draft",
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
        .catch(error => console.log(error))
    } catch (error) {
        console.log(error);
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