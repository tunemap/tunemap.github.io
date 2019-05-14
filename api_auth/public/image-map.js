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

	//handlebars templates compilation and grabbing
	var userTopTenImages = document.getElementById('user-top-ten-template').innerHTML,
		userTopTenTemplate = Handlebars.compile(userTopTenImages),
		userTopTenPlaceholder = document.getElementById('user-top-ten');

	//decoding of the uri hash params that are access_token and refresh_token
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
						if (i === response.items.length-1){
							artistsIds += response.items[i].id;
						} else{
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


			// $.ajax({
			//     url: 'https://api.spotify.com/v1/me/top/tracks',
			//     headers: {
			//       'Authorization': 'Bearer ' + access_token
			//     },
			//     success: function(response) {
			//       tracksPlaceholder.innerHTML = topTracksTemplate(response.items);
			//     }
			// });
		} else {
			// render initial screen
			$('#login').show();
			$('#loggedin').hide();
		}

		//event listener to refresh token not currently being used
		document.getElementById('obtain-new-token').addEventListener('click', function() {
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
		}, false);
		var baseURL = 'http://localhost:8888/share?id=';
		document.getElementById('share-map-btn').addEventListener('click', function() {
			$.ajax({
				type: 'POST',
				url: 'http://localhost:3000/share',
				data: {
					id: '',
					artists: 'ids='+artistsIds
				},
				success: function(data){
					console.log(data.id);
					alert('Share this url with your friend: '+baseURL+data.id)
				},
				error: function(error){
					console.log(error);
				}
			})
		}, false);
		$.ajax({
			type: 'GET',
			url: 'http://localhost:3000/share',
			dataType: 'JSON',
			success: function(data){
				console.log(data);
			},
			error: function(error){
				console.log(error);
			}
		})
	}
})();