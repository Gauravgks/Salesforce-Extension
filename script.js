console.log("in script");

var element = document.getElementById("myButton");
const reDirect = window.location.origin;

console.log(reDirect);

var insURL;

async function makeCallout(accessCode) {
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  try {
    const response = await fetch(
      "https://automatic-fishstick-96vgr655pxjcpj6q-8080.app.github.dev/?code=" + accessCode,
      options
    );
    const d = await response.json();
    console.log(d);
    insURL = d;
    var tokenAcc = document.getElementById("accessToken");
    var userInfoDiv = document.getElementById("userInfo");

    if (d.access_token) {
      document.getElementById("demo").style.display = "none";
      document.getElementById("myButton").style.display = "none";

      console.log(d.instance_url);
      document.getElementById("tokenHead").parentElement.style.display = "none";

      if (d.userInfo) {
        document.getElementById("userName").textContent =
          d.userInfo.name || "N/A";
        document.getElementById("userEmail").textContent =
          d.userInfo.email || "N/A";
        document.getElementById("userOrg").textContent =
          d.userInfo.organization_id || "N/A";

        // Set profile picture if available
        const profilePicture = document.getElementById("userPicture");
        if (d.userInfo.picture) {
          profilePicture.src = d.userInfo.picture;
          profilePicture.style.display = "block";
        } else {
          profilePicture.style.display = "none";
        }

        userInfoDiv.classList.remove("slds-hide");
      }
    } else {
      tokenAcc.innerHTML = "Error received from server: " + d.err;
      userInfoDiv.classList.add("slds-hide");
    }

    tokenAcc.setAttribute("style", "display:block");
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("accessToken").innerHTML =
      "An error occurred while processing your request.";
  }
}

chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  urlString = tabs[0].url;
  console.log(urlString);
  if (urlString.includes("code=")) {
    element.disabled = true;
    let paramString = urlString.split("?")[1];
    let queryString = new URLSearchParams(paramString);

    var code;
    for (let pair of queryString.entries()) {
      if (pair[0] == "code") code = pair[1];
      console.log("Key is: " + pair[0]);
      console.log("Value is: " + pair[1]);
    }
    console.log("code", code);
    makeCallout(code);
    return;
  }

  const extensionUrl =
    "chrome-extension://aejkjadepamoajebeodmcpadkaclaaoo/index.html";
  if (urlString === extensionUrl) {
    element.addEventListener("click", function () {
      // Redirect in the same tab instead of opening a new one
      window.location.href =
        "https://login.salesforce.com/services/oauth2/authorize?client_id=3MVG9dAEux2v1sLs27gH_PVBwCfYRfm4zw5mXYTHUReEg0YcapgT3qud6sbeTyydSAjHvh4ri.5uTaM2v7RUM&redirect_uri=chrome-extension://aejkjadepamoajebeodmcpadkaclaaoo/index.html&response_type=code";
    });
  } else {
    element.addEventListener("click", function () {
      window.open(extensionUrl);
    });
  }
});
