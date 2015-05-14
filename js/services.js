angular.module('songhop.services',['ionic.utils'])

//create factory to manage data between ctrlrs
.factory('User', function($http, $q, $localstorage, SERVER) {

	var o = {//creates return object 'o'

		username: false,
    	session_id: false,
		favorites: [], //creates attribute of object which is an array
		newFavorites: 0
	}

	// attempt login or signup
	o.auth = function(username, signingUp) {

	    var authRoute;

	    if (signingUp) {
	      authRoute = 'signup';
	    } else {
	      authRoute = 'login'
	    }

		 return $http.post(SERVER.url + '/' + authRoute, {username: username})
      .success(function(data){
        o.setSession(data.username, data.session_id, data.favorites);
      });
	}
	// set session data
	o.setSession = function(username, session_id, favorites) {
	    if (username) o.username = username;
	    if (session_id) o.session_id = session_id;
	    if (favorites) o.favorites = favorites;

	    // set data in localstorage object
	    $localstorage.setObject('user', { username: username, session_id: session_id });
	  }

	    // check if there's a user session present
	  o.checkSession = function() {
	    var defer = $q.defer();

	    if (o.session_id) {
	      // we are logged in and a session is present
	      defer.resolve(true); //resolve promise

	    } else {
	      // detect if there's a session in localstorage from previous use.
	      // if it is, pull into our service
	      var user = $localstorage.getObject('user');

	      if (user.username) {
	        // if there's a user, lets grab their favorites from the server
	        o.setSession(user.username, user.session_id);
	        o.populateFavorites().then(function() { //when successful
	          defer.resolve(true);
	        });
	      } else {
	        // no user info in localstorage, reject
	        defer.resolve(false);
	      }
	    }
	    return defer.promise;
	  }

	  // allows user to logout - wipe out our session data, clear return object and local storage object
	  o.destroySession = function() {
	    $localstorage.setObject('user', {});
	    o.username = false;
	    o.session_id = false;
	    o.favorites = [];
	    o.newFavorites = 0;
	  }

	//creates method to add songs into favorites array
	o.addSongToFavorites = function(song) {

		if(!song) return false;//exits if no songs or undefined
		o.favorites.unshift(song);//adds song to top of array so users will see it	
		o.newFavorites++; //increase newFavorites count:	
		// persist this to the server
    	return $http.post(SERVER.url + '/favorites', {session_id: o.session_id, song_id:song.song_id });
	}

	//asks for the song we want to remove at the index
	o.removeSongFromFavorites = function(song, index) {
		if(!song) return false;
		o.favorites.splice(index, 1);//removes one item from array at a given index

		// persist this to the server
	    return $http({
	      method: 'DELETE',
	      url: SERVER.url + '/favorites',
	      params: { session_id: o.session_id, song_id:song.song_id }
	    });
	}

	o.favoriteCount = function() {
	    return o.newFavorites; //returns total # of new favs
	  }

	// gets the entire list of this user's favs from server
	o.populateFavorites = function() {
	    return $http({
	      method: 'GET',
	      url: SERVER.url + '/favorites',
	      params: { session_id: o.session_id }
	    }).success(function(data){
	      // merge data into the queue
	      o.favorites = data;
	    });
  }

	return o; //returns object 'o' from the service

}) //no semi-colon here

// create a new factory called Recommendations that returns a object 
//containing an array (named queue) of our current recommendations. Since 
//this factory will be interacting with our server, be sure to inject $http 
//and our SERVER constant - inject $q because using promises
.factory('Recommendations', function($http, $q, SERVER) {	
	var o = {
		queue: []
	};

	var media; //initialize media variable

	o.init = function() {
		if (o.queue.length === 0) {
		// if there's nothing in the queue, fill it.
	  	//this also means that this is the first call of init
		return o.getNextSongs();

		} else {
		// otherwise, play the current song
		return o.playCurrentSong();
		}
	}

//Our recommendations queue will be empty until we retrieve songs from our server. 
//The server route we need to hit to retrieve new song recommendations is a GET 
//request to http://SERVER-URL/recommendations. It will return an array of ten 
//random songs Create the getNextSongs() method that makes a $http GET request to 
///recommendations. The success() function will add the new songs to our queue array:
	o.getNextSongs = function() {
		return $http({
		method: 'GET',
		url: SERVER.url + '/recommendations'
		}).success(function(data) {
		//merge data in queue
		o.queue = o.queue.concat(data);
		});
	}

  	//loads song from spotify-return a promise to make sure enough of song is 
  	//loaded before trying to play it
	o.playCurrentSong = function() {
		var defer = $q.defer();
		// play the current song's preview
		media = new Audio(o.queue[0].preview_url); //plays preview

		//when song loaded,resolves promise to notify controller
		media.addEventListener('loadeddata', function() {
			defer.resolve();
		});

		media.play();

		return defer.promise;

	}
	  	//Our favorite and skip buttons no longer work, as our sendFeedback()
  	// method isn't wired up to our Recommendations service. We need to 
  	//create a method in our Recommendations service that allows us to 
  	//remove the current song from the queue and proceed to the next one. 
  	//At the same time we'll check to see if the queue is low on songs, 
  	//and if it is, we'll fire getNextSongs(). This ensures our users 
  	//will never run out of songs to sample.
  	//Create a nextSong() method that sets the 0 index to the next song, 
  	//that pops the first array element off of our queue and fires getNextSongs() if necessary
  	o.nextSong = function() {
  		//pops the index 0 off
  		o.queue.shift();
  		//end the song
  		o.haltAudio();
  		// low on the queue? lets fill it up
  		if (o.queue.length <=3) {
  			o.getNextSongs();
  		}
  	}

	//used when switching to favorites tab
	o.haltAudio = function() {
		if (media) media.pause();//if something in media object call the pause method 
	}


	return o;
})







