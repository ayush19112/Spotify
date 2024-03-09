let currentSong = new Audio();
let playbtn = document.querySelector("#playbtn");
let previous = document.querySelector("#previous");
let next = document.querySelector("#next");
let currFolder;
// let volumebtn=document.querySelector(".voulmebtn i")

let songs;
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const formattedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  // let currentSong=new Audio();

  currFolder = folder;
  let a = await fetch(`${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let array = div.getElementsByTagName("a");
  // console.log(response);
  songs = [];
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // Show all the songs in the playlist
  let songUl = document
    .querySelector(".songsList")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = " ";
  if (songUl.hasChildNodes()) {
    songUl.innerHTML = "";
  }
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li> 
        
        <i class="fa-solid fa-music "></i>
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                 <div>Ayush</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <i class="fa-regular fa-circle-play"></i>
                            </div> </li>`;
  }
  //Attach an Event listener to each song
  Array.from(
    document.querySelector(".songsList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });
  return songs;
}

let playMusic = (track, pause = false) => {
  // let audio=new Audio("/oldsong/"+track)
  currentSong.src = `/${currFolder}/` + track;

  if (!pause) {
    currentSong.play();
    // playbtn.innerHTML = "<i class='fa-solid fa-circle-pause'></i>";
    playbtn.classList.remove("fa-circle-play");
      playbtn.classList.add("fa-circle-pause");
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function main() {
  //Get the list of all songs
  await getSongs("songs/engsongs");
  playMusic(songs[0], true);
  async function displayAlbums() {
    let a = await fetch(`./songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    // console.log(anchors);
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
      const e = array[index];
      console.log(e.href);

      if (e.href.includes("/songs/")&& !e.href.includes(".htaccess")) {
        // console.log(e.href)
        let folder = e.href.split("/").slice(-1);
        //Get the metadata of the fodlder
        let a = await fetch(`./songs/${folder}/info.json`);
        let response = await a.json();
        console.log(response);
        cardContainer.innerHTML +=
          `<div data-folder="${folder}" class="card">
                <div class="play">
                    <i class="fa-solid fa-play"></i>
                </div>
                <img src="./songs/${folder}/eng.png" alt=""/>
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`;
      }
    }

    //Load the palylist whenever card is clicked

    Array.from(document.querySelectorAll(".card")).forEach((e) => {
      console.log("Adding event listener to card");
      e.addEventListener("click", async (item) => {
        console.log("Fetching Songs");
        console.log("Data folder:", item.currentTarget.dataset.folder);
        songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        playMusic(songs[0]);
      });
    });
  }
  await displayAlbums();

  //Attach an event listener to play,next and previous
  playbtn.addEventListener("click", (evt) => {
    if (currentSong.paused) {
      currentSong.play();
      playbtn.classList.remove("fa-circle-play");
      playbtn.classList.add("fa-circle-pause");
    } else {
      currentSong.pause();
      playbtn.classList.remove("fa-circle-pause");
      playbtn.classList.add("fa-circle-play");
    }
    console.log(evt);
  });

  // //Play first song
  // var audio =new Audio(songs[0]);
  // audio.play();

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    const currentTime = Math.floor(currentSong.currentTime);
    const duration = Math.floor(currentSong.duration);

    // Update the time information
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentTime
    )}/${secondsToMinutesSeconds(duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    document.querySelector(".circle").style.left =
      (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //Add an event Listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //Add an event Listener for close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  //Add an event Listener to previous
  previous.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  //Add an event Listener to next
  next.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if(currentSong.volume > 0){
         volumebtn.classList.remove("fa-volume-mute");
      volumebtn.classList.add("fa-volume-high");
      }
    });

  //Add an event Listener to mute
  document.querySelector(".volumebtn").addEventListener("click", (e) => {
    let volumebtn = e.target;
    console.log(e.target);

    if (volumebtn.classList.contains("fa-volume-high")) {
      volumebtn.classList.remove("fa-volume-high");
      volumebtn.classList.add("fa-volume-mute");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      volumebtn.classList.remove("fa-volume-mute");
      volumebtn.classList.add("fa-volume-high");
      currentSong.volume = 0.9;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();