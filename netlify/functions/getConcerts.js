const axios = require("axios");

// Return a date of format 2019-01-01
const dateString = date => {
    return [
        date.getFullYear(),
        ("0" + (date.getMonth() + 1)).slice(-2),
        ("0" + date.getDate()).slice(-2)
    ].join("-");
};

exports.handler = async function (event, context) {
    const { lat, lng } = event.queryStringParameters;
    try {
        const { data: songkickData } = await axios.get(
            "https://api.songkick.com/api/3.0/events.json?",
            {
                params: {
                    location: `geo:${lat},${lng}`,
                    min_date: dateString(new Date()),
                    max_date: dateString(new Date()),
                    apikey: process.env.SONGKICK_API_KEY,
                    type: "Concert"
                }
            }
        );
        const events = songkickData.resultsPage.results.event;
        if (events) {
            const filteredEvents = events.filter(event => event.status === "ok");
            return {
                statusCode: 200,
                body: JSON.stringify(filteredEvents)
            }
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify("No results")
            }
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify(error)
        }
    }
}