const element = document.getElementById("myButton");

async function makeCallout(accessCode) {
  try {
    const response = await fetch(
      "https://salesforce-extension.onrender.com/?code=" + accessCode,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const responseData = await response.json();
    const tokenAcc = document.getElementById("accessToken");
    const userInfoDiv = document.getElementById("userInfo");

    if (responseData.access_token) {
      document.getElementById("demo").style.display = "none";
      document.getElementById("myButton").style.display = "none";
      document.getElementById("tokenHead").parentElement.style.display = "none";

      if (responseData.userInfo) {
        document.getElementById("userName").textContent =
          responseData.userInfo.name || "N/A";
        document.getElementById("userEmail").textContent =
          responseData.userInfo.email || "N/A";
        document.getElementById("userOrg").textContent =
          responseData.userInfo.organization_id || "N/A";

        const profilePicture = document.getElementById("userPicture");
        if (responseData.userInfo.picture) {
          profilePicture.src = responseData.userInfo.picture;
          profilePicture.style.display = "block";
        } else {
          profilePicture.style.display = "none";
        }

        userInfoDiv.classList.remove("slds-hide");
      }

      if (
        responseData.orgLimits &&
        typeof responseData.orgLimits === "object"
      ) {
        const orgLimitsDiv = document.getElementById("orgLimits");
        orgLimitsDiv.innerHTML = "";

        Object.entries(responseData.orgLimits)
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(([limitName, limitData]) => {
            if (limitData && typeof limitData === "object") {
              const max = parseInt(limitData.Max) || 0;
              const remaining = parseInt(limitData.Remaining) || 0;
              const used = max - remaining;
              const percentage = max > 0 ? Math.round((used / max) * 100) : 0;

              const limitItem = document.createElement("div");
              limitItem.className = "limit-item";
              limitItem.innerHTML = `
                <div class="limit-title">${formatLimitName(limitName)}</div>
                <div class="limit-percentage">${percentage}%</div>
                <div class="limit-value">
                  <div class="limit-value-row">
                    <div class="limit-value-label">Max:</div>
                    <div class="limit-value-number">${formatNumber(max)}</div>
                  </div>
                  <div class="limit-value-row">
                    <div class="limit-value-label">Used:</div>
                    <div class="limit-value-number">${formatNumber(used)}</div>
                  </div>
                  <div class="limit-value-row">
                    <div class="limit-value-label">Remaining:</div>
                    <div class="limit-value-number">${formatNumber(
                      remaining
                    )}</div>
                  </div>
                </div>
              `;
              orgLimitsDiv.appendChild(limitItem);
            }
          });
      } else {
        const orgLimitsDiv = document.getElementById("orgLimits");
        orgLimitsDiv.innerHTML =
          '<div class="error-message"><h3>Org Limits</h3><p>No organization limits data available</p></div>';
      }
    } else {
      tokenAcc.innerHTML =
        "Error received from server: " + (responseData.err || "Unknown error");
      userInfoDiv.classList.add("slds-hide");
    }

    tokenAcc.setAttribute("style", "display:block");
  } catch (error) {
    document.getElementById("accessToken").innerHTML =
      "An error occurred while processing your request: " + error.message;
  }
}

chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  const urlString = tabs[0].url;
  const extensionUrl =
    "chrome-extension://aejkjadepamoajebeodmcpadkaclaaoo/index.html";

  if (urlString.includes("code=")) {
    element.disabled = true;
    const paramString = urlString.split("?")[1];
    const queryString = new URLSearchParams(paramString);
    const code = queryString.get("code");
    makeCallout(code);
  } else if (urlString === extensionUrl) {
    element.addEventListener("click", function () {
      window.location.href =
        "https://login.salesforce.com/services/oauth2/authorize?client_id=3MVG9dAEux2v1sLs27gH_PVBwCfYRfm4zw5mXYTHUReEg0YcapgT3qud6sbeTyydSAjHvh4ri.5uTaM2v7RUM&redirect_uri=chrome-extension://aejkjadepamoajebeodmcpadkaclaaoo/index.html&response_type=code&scope=api%20refresh_token";
    });
  } else {
    element.addEventListener("click", function () {
      window.open(extensionUrl);
    });
  }
});

function formatLimitName(name) {
  return name
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}
