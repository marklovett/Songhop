angular.module('songhop.controllers', ['ionic', 'songhop.services'])
/*
Controller for the discover page
*/
//Since we're using $timeout, we'll need to inject it into our discover controller:
				//inject 'User' service in DicoverCtrl
//When our app first loads up, we'll want to fire a function to initialize our first
// set of songs. In our DiscoverCtrl, we can just fire Recommendations.getNextSongs().
// When it returns successfully, we'll set the current song to be the first one in 
//our queue (aka Recommendations.queue[0]). The song at index 0 of Recommendations.queue
// should always be the current song.
.controller('DiscoverCtrl', function($scope, $timeout, User, Recommendations) {
  // get our first three songs
  Recommendations.getNextSongs()
  	.then(function() {
  		$scope.currentSong = Recommendations.queue[0];
  	});


  	$scope.sendFeedback = function(bool) {
  		//adds current song to favorites
  		if (bool) User.addSongToFavorites($scope.currentSong);
  		// set variable for the correct animation sequence
  		$scope.currentSong.rated = bool;
  		$scope.currentSong.hide = true;
  		//throws the currentSong off the queue
  		Recommendations.nextSong();

  		$timeout(function() {//delays execution of lines below for 3s animation to complete
  			 // $timeout to allow animation to complete before changing to next song
      		// set the current song to one of our three songs
	  		// var randomSong = Math.round(Math.random() * ($scope.songs.length - 1));
	  		// update current song in scope
	  		// $scope.currentSong = angular.copy($scope.songs[randomSong]);
	  		//sets current song to the song at 0 index
	  		$scope.currentSong = Recommendations.queue[0];

  		}, 250);
  	}
})



/*
Controller for the favorites page
*/								//ask for the 'User' service
.controller('FavoritesCtrl', function($scope, User) {
	//get the list of our favs-define a 'favorites' variable on scope and bind it to User.favorites(the array in our service)
	$scope.favorites = User.favorites;
//expose method that will fire removeSongFromFavorites() User method, we structured as a func to allow future success message or other activities
	$scope.removeSong = function(song, index) {
		User.removeSongFromFavorites(song, index);
	}
})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope) {

});