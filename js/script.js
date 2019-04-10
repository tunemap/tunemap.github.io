const node = document.getElementById('searchbox');
node.addEventListener("keyup", function(event) {
	if (event.key === "Enter") {
		window.location.replace("./html/album-cloud.html");
	}
});