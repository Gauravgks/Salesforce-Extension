const http = require("http");
const fetch = require("node-fetch");

http
  .createServer(async function (req, res) {
    if (req.method === "POST" && req.url.includes("?code=")) {
      try {
        const respo = await getUserDetails(req.url.replace("/?code=", ""));
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin":
            "chrome-extension://aejkjadepamoajebeodmcpadkaclaaoo/index.html",
        });
        res.end(JSON.stringify(respo));
      } catch (err) {
        res.writeHead(300, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin":
            "chrome-extension://aejkjadepamoajebeodmcpadkaclaaoo/index.html",
        });
        res.end(JSON.stringify({ err }));
      }
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("Hello World!");
    }
  })
  .listen(8080);

async function getOrgLimits(instanceUrl, accessToken) {
  try {
    const limitsUrl = `${instanceUrl}/services/data/v58.0/limits`;
    const limitsResponse = await fetch(limitsUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!limitsResponse.ok) {
      return null;
    }

    return await limitsResponse.json();
  } catch (error) {
    return null;
  }
}

async function getUserDetails(authCode) {
  try {
    const response = await fetch(
      "https://login.salesforce.com/services/oauth2/token?grant_type=authorization_code&client_id=3MVG9dAEux2v1sLs27gH_PVBwCfYRfm4zw5mXYTHUReEg0YcapgT3qud6sbeTyydSAjHvh4ri.5uTaM2v7RUM&redirect_uri=chrome-extension://aejkjadepamoajebeodmcpadkaclaaoo/index.html&code=" +
        authCode,
      {
        method: "POST",
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
        },
      }
    );
    const json = await response.json();

    if (json.access_token) {
      try {
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
        const orgLimits = await getOrgLimits(
          json.instance_url,
          json.access_token
        );

        return {
          ...json,
          userInfo,
          orgLimits: orgLimits || {},
        };
      } catch (error) {
        return {
          ...json,
          userInfo: null,
          orgLimits: {},
        };
      }
    } else {
      throw json.error || "No access token received";
    }
  } catch (err) {
    throw err;
  }
}
