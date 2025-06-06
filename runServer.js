var http = require("http");
var fetch = require("node-fetch");

console.log("running server");

http
  .createServer(async function (req, res) {
    if (req.method == "POST") {
      console.log("POST req");
      console.log(req.url);
      //console.log(req)

      if (req.url.includes("?code=")) {
        try {
          const respo = await getUserDetails(req.url.replace("/?code=", ""));
          console.log("respo", respo);
          res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin":
              "chrome-extension://aejkjadepamoajebeodmcpadkaclaaoo/index.html",
          });
          res.end(JSON.stringify(respo));
        } catch (err) {
          console.log("err", err);
          res.writeHead(300, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin":
              "chrome-extension://aejkjadepamoajebeodmcpadkaclaaoo/index.html",
          });
          res.end(JSON.stringify({ err: err }));
        }
      }
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("Hello World!");
    }
  })
  .listen(8080);

async function getUserDetails(authCode) {
  console.log("authCode", authCode);
  console.log("before request");

  try {
    const response = await fetch(
      "http://login.salesforce.com/services/oauth2/token?grant_type=authorization_code&client_id=3MVG9dAEux2v1sLs27gH_PVBwCfYRfm4zw5mXYTHUReEg0YcapgT3qud6sbeTyydSAjHvh4ri.5uTaM2v7RUM&redirect_uri=chrome-extension://aejkjadepamoajebeodmcpadkaclaaoo/index.html&code=" +
        authCode,
      {
        method: "POST",
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
        },
      }
    );
    const json = await response.json();
    console.log("in then");

    if (json.access_token) {
      try {
        // Get user info using the access token
        const userInfoResponse = await fetch(
          json.instance_url + "/services/oauth2/userinfo",
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + json.access_token,
            },
          }
        );
        const userInfo = await userInfoResponse.json();

        // Combine the auth response with user info
        return {
          ...json,
          userInfo,
        };
      } catch (error) {
        console.error("Error fetching user info:", error);
        throw error;
      }
    } else {
      throw json.error;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}
