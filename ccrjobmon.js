if (Notification.permission !== "denied") {
    Notification.requestPermission();
}

var divJobs = document.querySelector(".jobsCount");
divJobs.addEventListener("DOMCharacterDataModified", function (event) {
	if (Notification.permission === "granted") {
		new Notification("New job started!");
	}
}, false);

var refreshBtn = sap.ui.getCore().byId(document.evaluate("//span[text()='Refresh']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement.id);
window.setInterval(function () {
	refreshBtn.firePress();
}, 3000);
