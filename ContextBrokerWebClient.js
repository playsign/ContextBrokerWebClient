var cb_xhr = null; // http request
var BACKEND_ADDRESS_CB = "http://orion.lab.fi-ware.org:1026/ngsi10/contextEntities/";

function getCBInfo() {
    console.log("Doing search from " + BACKEND_ADDRESS_CB);
    restQueryURL = BACKEND_ADDRESS_CB + "urn:smartsantander:testbed:357"
    console.log("restQueryURL: " + restQueryURL);
    cb_xhr = new XMLHttpRequest();

    cb_xhr.onreadystatechange = function() {
	if (cb_xhr.readyState === 4) {
	    if (cb_xhr.status === 200) {
		console.log("success: " + cb_xhr.responseText);
		var json = JSON.parse(cb_xhr.responseText);
		parseCBData(json);
		console.log(json);
	    } else if (cb_xhr.status === 404) {
		console.log("failed: " + cb_xhr.responseText);
	    }
	}
    }

    cb_xhr.onerror = function(e) {
	console.log("failed to get CB info.");
    };

    cb_xhr.open("GET", restQueryURL, true);
    cb_xhr.setRequestHeader("Content-Type", "application/json");
    cb_xhr.setRequestHeader("Accept", "application/json");
    cb_xhr.setRequestHeader("X-Auth-Token", "4wUdbVliV55X5zI68DfDZgVI-by2MBR0s3QhJF7WwwOU0u5AO3f85ycMouzxr3UWGfbCjO3ODcaM6ybtHLcJPA");
    cb_xhr.send();
}

function parseCBData(json) {
}

getCBInfo();
