// These functions just simply play or pause the player
// Created for event listeners

//-----------------------------------------------------------------------------

function playOther(roomnum) {
    socket.emit('play other', {
        room: roomnum
    });
}

socket.on('justPlay', function(data) {
    console.log("currPlayer")
    switch (currPlayer) {
        case 0:
            if (playerStatus == -1 || playerStatus == 2) {
                player.playVideo()
            }
            break;
        case 1:
            if (dailyPlayer.paused) {
                dailyPlayer.play();
            }
            break;
        case 2:
            vimeoPlayer.getPaused().then(function(paused) {
                // paused = whether or not the player is paused
                if (paused) {
                    vimeoPlayer.play();
                } else {
                    console.log("already playing")
                }

            }).catch(function(error) {
                // an error occurred
                console.log("Error: Could not retrieve Vimeo Player state")
            });
            break;
    }
});

function pauseOther(roomnum) {
    socket.emit('pause other', {
        room: roomnum
    });
    //socket.broadcast.to("room-"+roomnum).emit('justPlay');
}

socket.on('justPause', function(data) {
    console.log("hiIamPausing!")
    switch (currPlayer) {
        case 0:
            player.pauseVideo()
            break;
        case 1:
            dailyPlayer.pause()
            break;
        case 2:
            vimeoPlayer.getPaused().then(function(paused) {
                // paused = whether or not the player is paused
                if (paused) {
                    console.log("already paused")
                } else {
                    vimeoPlayer.pause();
                }

            }).catch(function(error) {
                // an error occurred
                console.log("Error: Could not retrieve Vimeo Player state")
            });
            break;
    }
    player.pauseVideo()
});

function seekOther(roomnum, currTime) {
    socket.emit('seek other', {
        room: roomnum,
        time: currTime
    });
    // socket.emit('getData');
}


// Weird for YouTube because there is no built in seek event
// It seeks on an buffer event
// Only syncs if off by over .1 seconds
socket.on('justSeek', function(data) {
    console.log("Seeking Event!")
    currTime = data.time
    switch (currPlayer) {
        case 0:
            var clientTime = player.getCurrentTime();
            if (clientTime < currTime - .1 || clientTime > currTime + .1) {
                player.seekTo(currTime);
                // Forces video to play right after seek
                player.playVideo()
            }
            break;
        case 1:
            var clientTime = dailyPlayer.currentTime;
            if (clientTime < currTime - .1 || clientTime > currTime + .1) {
                dailyPlayer.seek(currTime);
            }
            playOther(roomnum)
            break;
        case 2:
            vimeoPlayer.getCurrentTime().then(function(seconds) {
                // seconds = the current playback position
                if (seconds < currTime - .1 || seconds > currTime + .1) {
                    vimeoPlayer.setCurrentTime(currTime).then(function(seconds) {
                        // seconds = the actual time that the player seeked to

                    }).catch(function(error) {
                        switch (error.name) {
                            case 'RangeError':
                                // the time was less than 0 or greater than the video’s duration
                                console.log("the time was less than 0 or greater than the video’s duration")
                                break;
                            default:
                                // some other error occurred
                                break;
                        }
                    });
                }
            }).catch(function(error) {
                // an error occurred
                console.log("Error: Could not retrieve Vimeo player current time")
            });

            break;
    }
});
