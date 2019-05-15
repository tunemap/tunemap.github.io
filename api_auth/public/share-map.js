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

	var userTopTenImages = document.getElementById('user-top-ten-template').innerHTML,
		userTopTenTemplate = Handlebars.compile(userTopTenImages),
		userTopTenPlaceholder = document.getElementById('user-top-ten');

	var params = getHashParams();

	var access_token = params.access_token,
		refresh_token = params.refresh_token,
		error = params.error,
		idValue = params.idValue

	console.log(idValue);

	if (error) {
		alert('There was an error during the authentication');
	} else {
		if (access_token) {

			$.ajax({
				type: 'GET',
				url: 'http://localhost:3000/share?id=' + idValue,
				dataType: 'JSON',
				success: function(data) {
					console.log(data);
					let from_user = document.getElementById('username');
					from_user.innerHTML = data[0].user + "'s MusicMap";
					from_user.onclick = function() {
						location.assign(data[0].username_url);
					}

					$.ajax({
						url: 'https://api.spotify.com/v1/artists',
						data: data[0].artists,
						headers: {
							'Authorization': 'Bearer ' + access_token
						},
						success: function(response) {
							userTopTenPlaceholder.innerHTML = userTopTenTemplate(response.artists);
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
				},
				error: function(error) {
					console.log(error);
				}
			})

		} else {
			// render initial screen
			$('#login').show();
			$('#loggedin').hide();
		}

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
	}
})();