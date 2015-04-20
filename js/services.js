angular.module('songhop.services',[])

// create a new factory called Recommendations that returns a object 
//containing an array (named queue) of our current recommendations. Since 
//this factory will be interacting with our server, be sure to inject $http 
//and our SERVER constant:
.factory('Recommendations', function($http, SERVER) {	
	var o = {
		queue: []
	};
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
  		// low on the queue? lets fill it up
  		if (o.queue.length <=3) {
  			o.getNextSongs();
  		}
  	}

	return o;
})

//create factory to manage data between ctrlrs
.factory('User', function() {

	var o = {//creates return object 'o'

		favorites: [] //creates attribute of object which is an array
	}
	//creates method to add songs into favorites array
	o.addSongToFavorites = function(song) {

		if(!song) return false;//exits if no songs or undefined
		o.favorites.unshift(song);//adds song to top of array so users will see it		
	}
	//asks for the song we want to remove at the index
	o.removeSongFromFavorites = function(song, index) {

		if(!song) return false;
		o.favorites.splice(index, 1);//removes one item from array at a given inde
	}

	return o; //returns object 'o' from the service

});













