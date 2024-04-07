document.addEventListener("DOMContentLoaded", () => {
    


    const masterPlayButton = document.querySelector('.PlaylistShowcase_Play');
    const playlistItems = document.querySelectorAll('.playlist.items');
        playlistItems.forEach(item => item.classList.add('disabled'));
    const listItems = document.querySelectorAll('.public-list-item');
    const playPauseControls = document.querySelectorAll('.e2col-tr-play');
    const waveSurferContainers = document.querySelectorAll('.public-list-item-progress');
    const playTimeParents = document.querySelectorAll('.public-list-item-time');
    //const playSVGs = Array.from(document.querySelectorAll('.PlayerPlay .PlayerPlay-icon:not(.PlayerPlay-icon--hidden'));
    //const pauseSVGs = Array.from(document.querySelectorAll('.PlayerPlay .PlayerPlay-icon.PlayerPlay-icon--hidden'));
    const playTimeContainers = document.querySelectorAll('.PlayTime_Cont');
    const bigPlayIconSVGs = masterPlayButton.querySelectorAll('.PlayerPlay svg path');
    const bigPlayPath = 'm23.072 13.656-17.06 9.992C4.617 24.473 3 23.775 3 22.316V1.665C3 .237 4.68-.461 6.012.332l17.06 10.025c1.237.73 1.237 2.537 0 3.299Z'
    const bigPausePath = 'M2 22.857C2 23.488 2.512 24 3.143 24h4.714C8.488 24 9 23.488 9 22.857V1.143C9 .512 8.488 0 7.857 0H3.143C2.512 0 2 .512 2 1.143v21.714Zm13 0c0 .631.512 1.143 1.143 1.143h4.714c.631 0 1.143-.512 1.143-1.143V1.143C22 .512 21.488 0 20.857 0h-4.714C15.512 0 15 .512 15 1.143v21.714Z'; 

//function to resume the audio context

    function resumeAudioContext() {
        if (typeof Howler !== 'undefined' && Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume();
        }
    }

    document.addEventListener('click', resumeAudioContext);
    document.addEventListener('scroll', resumeAudioContext);

    const audioSources = [
        "https://okayhoneydew.github.io/Audio/Heidi%20Webster%20-%20Airport%20Demo%20Clip.mp3",
        "https://okayhoneydew.github.io/Audio/Heidi%20Webster%20-%20Airport%20Master%20Clip.mp3",
        // Add more audio sources as needed
        ];


//initialize tracks and wavesurfer instances

    let tracks = audioSources.map((source, index) => {
            let howl = new Howl({ 
                src: [source],
                preload: 'metadata',
                onload: function() {
                    if (playlistItems[index]) {
                        playlistItems[index].classList.remove('disabled');
                    }
                    const totalDuration = howl.duration();
                    playTimeContainers[index].textContent = formatTime(totalDuration);
                }
            });

            const wavesurfer = WaveSurfer.create({
                container: waveSurferContainers[index],
                height: 45,
                splitChannels: false,
                normalize: true,
                waveColor: "#d6d6e8",
                progressColor: "#57d9a3",
                cursorWidth: -1,
                barWidth: 1.5,
                barGap: 1.5,
                dragToSeek: false,
                interact: true,
            });

            wavesurfer.load(audioSources[index]);
            
            return { howl, wavesurfer };

    });

    let currentTrackIndex = null;

    //format time in mm:ss
    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    //stop all tracks
    function stopAllTracks(exceptTrack) {
        tracks.forEach((track, index) => {
            if (track !== exceptTrack && track.howl.playing()) {
                track.howl.stop();
                const playPauseButton = playPauseControls[index];
                const iconSVGs = playPauseButton.querySelectorAll('.PlayerBar2-icon svg path');
                const playOverlay = document.querySelectorAll('.e2col-tr-play-overlay')[index];
                const playElement = document.querySelectorAll('.e2col-tr-play')[index];
                const playPath = 'M8 5v14l11-7z';
                const totalDuration = track.howl.duration();
                playTimeContainers[index].textContent = formatTime(totalDuration);
    
                iconSVGs[1].setAttribute('d', playPath);
                playOverlay.removeAttribute('data-is-playing');
                playElement.removeAttribute('data-is-playing');
            }
        });
    }

    //Function to update the master play button style
    function updateMasterPlayButton() {
        const isAnyTrackPlaying = tracks.some((track) => track.howl.playing());
        const isCurrentTrackPlaying = currentTrackIndex !== null && tracks[currentTrackIndex].howl.playing();
        bigPlayIconSVGs[0].setAttribute('d', isCurrentTrackPlaying ? bigPausePath : bigPlayPath);
        if (isAnyTrackPlaying) {
            masterPlayButton.setAttribute('data-is-playing', '');
        } else {
            masterPlayButton.removeAttribute('data-is-playing');
        }
    }

    //master play button functionality
    masterPlayButton.addEventListener('click', () => {
    //if no track played yet...
        if (currentTrackIndex === null) {
        tracks[0].howl.play();
        currentTrackIndex = 0;
        } else {
        //if track all ready playing, pause it
            if (tracks[currentTrackIndex].howl.playing()) {
                tracks[currentTrackIndex].howl.pause();
            } else {
                tracks[currentTrackIndex].howl.play();
            }
        }
        updateMasterPlayButton();
    });

    //play/pause and icon switch function::

    function handlePlayPause(track, index) {
        const playPauseButton = playPauseControls[index];
        const iconSVGs = playPauseButton.querySelectorAll('.PlayerBar2-icon svg path');   
        const playOverlay = document.querySelectorAll('.e2col-tr-play-overlay')[index];
        const playElement = document.querySelectorAll('.e2col-tr-play')[index];
        const playPath = 'M8 5v14l11-7z';
        const pausePath = 'M6 19h4V5H6v14zm8-14v14h4V5h-4z';
        const fadeDuration = .5;

        if (track.howl.playing()) {
            track.howl.pause(); 
            iconSVGs[1].setAttribute('d', playPath);  
            playOverlay.removeAttribute('data-is-playing');
            playElement.removeAttribute('data-is-playing');              
        } else {
            stopAllTracks(track);
            track.howl.play();
            track.howl.fade(0, 1, fadeDuration * 1000);
            iconSVGs[1].setAttribute('d', pausePath);
            playOverlay.setAttribute('data-is-playing', '');
            playElement.setAttribute('data-is-playing', '');
        }
        currentTrackIndex = index; //update current track index
        updateMasterPlayButton();  
    }

    //play/pause button functionality
        tracks.forEach((track, index) => {
            playPauseControls[index] && listItems[index].addEventListener('click', () => {
            handlePlayPause(track, index);
        });

        // Display the total duration when the sound is loaded
        track.howl.on('load', () => {
                const intervalId = setInterval(() => {
                    const totalDuration = track.howl.duration();
                    if (totalDuration) {
                        playTimeContainers[index].textContent = formatTime(totalDuration);
                        clearInterval(intervalId);
                    }
                }, 100);
        });
        
        track.wavesurfer.on('interaction', function(newTime) {
            track.howl.seek(newTime);
            if (!track.howl.playing()) {
                handlePlayPause(track, index);
            }
        });

        track.howl.on('seek', function() {
            if (!track.howl.playing()) {
                handlePlayPause(track, index);
            }
        });

        //display the current play time for each track and update the waveform
        track.howl.on('play', () => {
            setInterval(() => {
                const currentTime = track.howl.seek();
                const totalDuration = track.howl.duration();
                const progress = currentTime / totalDuration;
                track.wavesurfer.seekTo(progress);
                playTimeContainers[index].textContent = formatTime(currentTime);
            }, 1000);
        });
    });
});
