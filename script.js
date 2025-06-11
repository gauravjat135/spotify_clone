console.log("Let's write JavaScript!");
let currentsong = new Audio();
let songs;
let currfolder;

// Function to format seconds into MM:SS
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      // Fix: Use decodeURIComponent and handle both absolute and relative URLs
      let songName = element.href.split(`${location.origin}/${folder}/`).pop();
      songs.push(decodeURIComponent(songName));
    }
  }

  // Show all the songs in the playlist
  let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `<li> 
              <img class="invert" src="img/music (2).png" height="25px" alt="">
              <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Gaurav</div>
              </div>
              <div class="playnow">
                <span>Play Now</span>
                <img class="invert" width="20px" src="img/play-button (1).png" alt="">
              </div></li>`;
  }

  // Attach an Event Listener to each song
  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", event => {
      playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playmusic = (track, pause = false) => {
  currentsong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "img/pause.png";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
  console.log("displaying albums");
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];
      // Get the metadata of the folder
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      cardcontainer.innerHTML += `<div data-folder="${folder}" class="card">
            <div class="on"><img src="img/play-button.png" alt=""></div>
            <img src="/songs/${folder}/cover.png" alt="">
            <h2>${response.title}</h2>
            <p>${response.discription}</p>
        </div>`;
    }
  }

  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      console.log("Fetching Songs");
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      playmusic(songs[0]);
    });
  });
}

async function main() {
  // Get the list of all songs
  await getsongs("songs/happyhits");
  playmusic(songs[0], true);

  // Display all the albums on the page
  displayAlbums();

  // Attach an event listener to play, next & previous
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "img/pause.png";
    } else {
      currentsong.pause();
      play.src = "img/play-button (1).png";
    }
  });

  // Listen for timeupdate event
  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;

    // Update the filled color of the seekbar
    const percent = (currentsong.currentTime / currentsong.duration) * 100;
    document.querySelector(".filled").style.width = percent + "%"; // Change the filled bar width
    document.querySelector(".circle").style.left = percent + "%"; // Update circle position
  });

  // // Add an event listener to seekbar
  // document.querySelector(".seekbar").addEventListener("click", e => {
  //   let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
  //   document.querySelector(".circle").style.left = percent + "%";
  //   currentsong.currentTime = (currentsong.duration * percent) / 100;

  //   // Update filled bar color based on the click
  //   document.querySelector(".filled").style.width = percent + "%";
  // });


  // Add an event listener to the seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    const seekbar = e.currentTarget; // The seekbar element
    const seekbarWidth = seekbar.getBoundingClientRect().width; // Get the seekbar width
    const clickX = e.clientX - seekbar.getBoundingClientRect().left; // Get the click position relative to the seekbar
    const percent = (clickX / seekbarWidth) * 100; // Calculate the percentage clicked

    // Set the currentTime based on the percentage clicked
    currentsong.currentTime = (currentsong.duration * percent) / 100;

    // Update filled bar color and circle position based on the click
    const filledBar = document.querySelector(".filled");
    filledBar.style.width = percent + "%"; // Change the filled bar width
    const circle = document.querySelector(".circle");
    circle.style.left = percent + "%"; // Update circle position
  });

  // Listen for timeupdate event
  currentsong.addEventListener("timeupdate", () => {
    const percent = (currentsong.currentTime / currentsong.duration) * 100; // Calculate the percentage played

    // Update the width of the filled section
    const filledBar = document.querySelector(".filled");
    filledBar.style.width = percent + "%"; // Change the filled bar width

    // Update the circle position
    const circle = document.querySelector(".circle");
    circle.style.left = percent + "%"; // Update circle position

    // Update song time display
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;
  });







  // Add an event listener for the hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    const leftPanel = document.querySelector(".left");
    leftPanel.style.left = leftPanel.style.left === "-110%" ? "0" : "-110%";
  });

  // Add an event listener for close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  // Add an event listener to previous
  previous.addEventListener("click", () => {
    currentsong.pause();
    console.log("Previous clicked");
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if ((index - 1) >= 0) {
      playmusic(songs[index - 1]);
    }
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    currentsong.pause();
    console.log("Next clicked");
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if ((index + 1) < songs.length) {
      playmusic(songs[index + 1]);
    }
  });

  // Add an event listener to play the next song when the current song ends
  currentsong.addEventListener("ended", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if ((index + 1) < songs.length) {
      playmusic(songs[index + 1]);
    }
  });

  // Add an event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log("Setting volume to", e.target.value, "/ 100");
    currentsong.volume = parseInt(e.target.value) / 100;
    if (currentsong.volume > 0) {
      document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("img/mute(1).png", "img/volume-up.png");
    }
  });

  // Add an event listener to the volume icon to mute/unmute the track
  document.querySelector(".volume > img").addEventListener("click", (e) => {
    if (currentsong.volume > 0) {  // If volume is greater than 0, mute the audio
      e.target.src = "img/mute(1).png";
      currentsong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;  // Set range slider to 0
    } else {  // Unmute and set to a default volume (20%)
      e.target.src = "img/volume-up.png";
      currentsong.volume = 0.2;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 20;  // Set range slider to 20
    }
  });

  // Keyboard Controls
  document.addEventListener("keydown", (e) => {
    // Play/Pause with Space bar
    if (e.code === "Space") {
      e.preventDefault(); // Prevent scrolling the page
      if (currentsong.paused) {
        currentsong.play();
        play.src = "img/pause.png";
      } else {
        currentsong.pause();
        play.src = "img/play-button (1).png";
      }
    }

    // Rewind 10 seconds with Left arrow
    if (e.code === "ArrowLeft") {
      currentsong.currentTime = Math.max(0, currentsong.currentTime - 10);
    }

    // Fast-forward 10 seconds with Right arrow
    if (e.code === "ArrowRight") {
      currentsong.currentTime = Math.min(currentsong.duration, currentsong.currentTime + 10);
    }

    // Increase volume with Up arrow
    if (e.code === "ArrowUp") {
      currentsong.volume = Math.min(1, currentsong.volume + 0.1); // Increase volume by 10%
      document.querySelector(".range").getElementsByTagName("input")[0].value = Math.round(currentsong.volume * 100);
      // Update volume icon if volume is above 0
      if (currentsong.volume > 0) {
        document.querySelector(".volume > img").src = "img/volume-up.png";
      }
    }

    // Decrease volume with Down arrow
    if (e.code === "ArrowDown") {
      currentsong.volume = Math.max(0, currentsong.volume - 0.1); // Decrease volume by 10%
      document.querySelector(".range").getElementsByTagName("input")[0].value = Math.round(currentsong.volume * 100);
      // Update volume icon if muted
      if (currentsong.volume === 0) {
        document.querySelector(".volume > img").src = "img/mute(1).png";
      }
    }
  });
}

main();
