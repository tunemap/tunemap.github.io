(function() {

	/**
	 * Obtains parameters from the hash of the URL
	 */
	function getHashParams() {
		var hashParams = {};
		var e, r = /([^&;=]+)=?([^&;]*)/g,
			q = window.location.hash.substring(1);
		while (e = r.exec(q)) {
			hashParams[e[1]] = decodeURIComponent(e[2]);
		}
		return hashParams;
	}

	//grab modal
	var modal = document.getElementById("myModal");

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
		modal.style.display = "none";
	}

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}

	//grab element template and compile it in handlebars
	var userTopTenImages = document.getElementById('user-top-ten-template').innerHTML,
		userTopTenTemplate = Handlebars.compile(userTopTenImages),
		userTopTenPlaceholder = document.getElementById('user-top-ten');

	//grab the hashed params from the url aka access and refresh tokens
	var params = getHashParams();

	var access_token = params.access_token,
		refresh_token = params.refresh_token,
		error = params.error;

	var artistsIds = '';
	if (error) {
		alert('There was an error during the authentication');
	} else {
		if (access_token) {

			$.ajax({
				url: 'https://api.spotify.com/v1/me/top/artists',
				headers: {
					'Authorization': 'Bearer ' + access_token
				},
				success: function(response) {
					for (var i = 0; i < response.items.length; i++) {
						if (i === response.items.length - 1) {
							artistsIds += response.items[i].id;
						} else {
							artistsIds += response.items[i].id += ',';
						}
					}
					userTopTenPlaceholder.innerHTML = userTopTenTemplate(response.items);
					$("#layout-1").justifiedGallery({
						rowHeight: document.documentElement.clientHeight / 2.5,
						maxRowHeight: document.documentElement.clientHeight / 2.5,
						margins: 0,
						lastRow: 'justify',
						randomize: true
					});
					$('#login').hide();
					$('#loggedin').show();
				}
			});
		} else {
			// render initial screen
			$('#login').show();
			$('#loggedin').hide();
		}

		let username = '';
		username_url = '';
		$.ajax({
			url: 'https://api.spotify.com/v1/me',
			headers: {
				'Authorization': 'Bearer ' + access_token
			}
		}).done(function(data) {
			username = data.display_name;
			username_url = data.external_urls.spotify;
		});

		//add event listener to a button to refresh the users token, currently not implemented
		/*document.getElementById('obtain-new-token').addEventListener('click', function() {
			$.ajax({
				url: '/refresh_token',
				data: {
					'refresh_token': refresh_token
				}
			}).done(function(data) {
				access_token = data.access_token;
				oauthPlaceholder.innerHTML = oauthTemplate({
					access_token: access_token,
					refresh_token: refresh_token
				});
			});
		}, false);*/

		//share functionality of your own personal music map
		var baseURL = 'http://localhost:8888/share?id=';
		document.getElementById('share-map-btn').addEventListener('click', function() {
			$.ajax({
				type: 'POST',
				url: 'http://localhost:3000/share',
				data: {
					id: '',
					artists: 'ids=' + artistsIds,
					user: username,
					username_url: username_url
				},
				success: function(data) {
					console.log(data.id);
					//add modal here
					modal.style.display = "block";

					document.getElementById("body-text").innerHTML = 'Share this url with your friend: ';
					let share_url = document.getElementById('share-url');
					share_url.innerHTML = baseURL + data.id;
					share_url.onclick = function() {
						location.assign(baseURL + data.id);
					}

					//alert('Share this url with your friend: '+baseURL+data.id)
				},
				error: function(error) {
					console.log(error);
				}
			})
		}, false);

		$.ajax({
			type: 'GET',
			url: 'http://localhost:3000/share',
			dataType: 'JSON',
			success: function(data) {
				console.log(data);
			},
			error: function(error) {
				console.log(error);
			}
		})
	}
})();