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
.controller('DiscoverCtrl', function($scope, $timeout, $ionicLoading, User, Recommendations) {
      
      var showLoading = function() {
        $ionicLoading.show({
          template: '<i class="ion-loading-c"></i>',
          noBackdrop: true
        })
      }

      var hideLoading = function() {
        $ionicLoading.hide();
      }

      showLoading();


  // get our first three songs
    Recommendations.init()
    	.then(function() {
    		$scope.currentSong = Recommendations.queue[0];
        return Recommendations.playCurrentSong();
        
    	})
      .then(function() {
        //hides loading indicator once songs have been retreived
        hideLoading();
        $scope.currentSong.loaded = true;
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

      Recommendations.playCurrentSong().then(function() {
        $scope.currentSong.loaded = true;
      })
  	}


    //return the next album's image-caching the image for the next song in the queue
    $scope.nextAlbumImg = function() {
      if (Recommendations.queue.length > 1) {
        return Recommendations.queue[1].image_large;
      }
      return '';//if there isn't an album image available next, return empty string.
    }
})

/*
Controller for the favorites page
*/								//ask for the 'User' service
.controller('FavoritesCtrl', function( $scope, $window, $ionicActionSheet, $timeout, User ) {
	//get the list of our favs-define a 'favorites' variable on scope and bind it to User.favorites(the array in our service)
	$scope.favorites = User.favorites;
  $scope.username = User.username;
//expose method that will fire removeSongFromFavorites() User method, we structured as a func to allow future success message or other activities
	$scope.removeSong = function(song, index) {
		User.removeSongFromFavorites(song, index);
	}
  $scope.openSong = function(song) {
    $window.open(song.open_url, "_system");//opens in system browser
  }

 // Triggered on a button click, or some other target
 $scope.show = function() {

   // Show the action sheet
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: '<b>Share</b> on Twitter'},
       { text: '<b>Share</b> on Facebook'}
     ],
     destructiveText: '',
     titleText: '',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {
       return true;
     }
   });

   // For example's sake, hide the sheet after two seconds
   // $timeout(function() {
   //   hideSheet();
   //  }, 6000);

 }

})

/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope, $window, User, Recommendations) {
    //stop audio when going to favorites page
    $scope.enteringFavorites = function() {
      Recommendations.haltAudio();
       User.newFavorites = 0; //reset new favs to 0 when clck fav tab
    }

    $scope.leavingFavorites = function() {
      Recommendations.init();
    }
//logic for logging out
    $scope.logout = function() {
      User.destroySession();
    // instead of using $state.go, we're going to redirect.
    // reason: we need to ensure views aren't cached. full page redirect
      $window.location.href = 'index.html'; //reroutes 
    }
    // expose the number of new favorites to the scope
    $scope.favCount = User.favoriteCount;

})


.controller('SplashCtrl', function($scope, $state, User) {
      // attempt to signup/login via User.auth
      $scope.submitForm = function(username, signingUp) {
      User.auth(username, signingUp).then(function(){
        // session is now set, so lets redirect to discover page
        $state.go('tab.discover');

      }, function() {
        // error handling here
        alert('Hmm... try another username.');

      });
    }
});




