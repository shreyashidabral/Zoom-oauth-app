require("dotenv/config");
const request = require("request");
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  // If authorization code is available in URL, user has been authorized
  // else the user needs to be redirected to Zoom OAuth to authorize.

  if (req.query.code) {
    // Requesting an access token after getting auth code

    let authurl =                 
        "https://zoom.us/oauth/token?grant_type=authorization_code&code=" +
        req.query.code +
        "&redirect_uri=" +
        process.env.redirectURL;           //Authentication url

    request.post(authurl, (error, response, body) => {
        body = JSON.parse(body);
        console.log("Sign-in successful");

        if (body.access_token) {           //if access token is successfully received after authentication, create a meeting for user
            let meetingdetails = {
                topic: "Title of zoom meeting",
                type: 2,
                start_time: "23-01-14T10: 21: 57",
                duration: "60",
                timezone: "Asia/Calcutta",
                agenda: "test",

                recurrence: { type: 1, repeat_interval: 1 },
                    settings: {
                    host_video: "true",
                    participant_video: "true",
                    join_before_host: "False",
                    mute_upon_entry: "False",
                    watermark: "true",
                    audio: "voip",
                    auto_recording: "cloud",
                },
            };

            let meeturl = "https://api.zoom.us/v2/users/me/meetings";    //url to create meeting
            let headers = {
                "Content-Type": "application/json",
                Authorization: "Bearer " + body.access_token,
            };

            var joinlink = "";     //joining url for zoom meeting
            var pass = "";         //meeting password

            request(
                {
                    url: meeturl,
                    body: JSON.stringify(meetingdetails),
                    headers: headers,
                    method: "post",
                },
                (error, response, body) => {

                    if (error) {
                        console.log("API Response Error: ", error);
                    } 
                    else if(response.statusCode == 201){   //if we receive a succesful response
                        body = JSON.parse(body);
                        console.log("Meeting in progress");
                        joinlink = body.join_url;
                        pass = body.password;

                        res.send(`
                            <style>
                            @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600&display=swap');@import url('https://necolas.github.io/normalize.css/8.0.1/normalize.css');html {color: #232333;font-family: 'Open Sans', Helvetica, Arial, sans-serif;-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;}h2 {font-weight: 700;font-size: 24px;}h4 {font-weight: 600;font-size: 14px;}.container {margin: 24px auto;padding: 16px;max-width: 720px;}.info {display: flex;align-items: center;}.info>div>span, .info>div>p {font-weight: 400;font-size: 13px;color: #747487;line-height: 16px;}.info>div>span::before {content: "👋";}.info>div>h2 {padding: 8px 0 6px;margin: 0;}.info>div>p {padding: 0;margin: 0;}.info>img {background: #747487;height: 96px;width: 96px;border-radius: 31.68px;overflow: hidden;margin: 0 20px 0 0;}.response {margin: 32px 0;display: flex;flex-wrap: wrap;align-items: center;justify-content: space-between;}.response>a {text-decoration: none;color: #2D8CFF;font-size: 14px;}.response>pre {overflow-x: scroll;background: #f6f7f9;padding: 1.2em 1.4em;border-radius: 10.56px;width: 100%;box-sizing: border-box;}
                            </style>
                            <div class="container">
                                <div class="meet">
                                    <h3>Join Zoom Meet</h3>
                                    <p>Meeting link - <a href = ${joinlink}> Join </a> </p>
                                    <p>Password - ${pass} </p>
                                </div>
                            </div>
                        `);
                    }

                }
            );
        } else {
            res.send("Something went wrong, Please try again!");
            console.log("Invalid access token");
        }
    }).auth(process.env.clientID, process.env.clientSecret);

    return;
  }

    // If no authorization code is available, redirect to Zoom OAuth to authorize
    res.redirect(
        "https://zoom.us/oauth/authorize?response_type=code&client_id=" +
        process.env.clientID +
        "&redirect_uri=" +
        process.env.redirectURL
    );
});

app.listen(4000, () =>
  console.log(`Zoom Hello World app listening at PORT: 4000`)
);
