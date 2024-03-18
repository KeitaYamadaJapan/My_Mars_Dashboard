

// Immutable state object
let store = Immutable.Map({
    user: Immutable.Map({ name: 'Nasa Dashboard' }),
    apod: '',
    rovers: Immutable.List(['curiosity', 'opportunity', 'spirit']),
    currentRover: 'none'
})

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    // check if "currentRover" is "none" and render buttons

    const yourName = Greeting(state.get('user').get('name'))
    if (state.get('currentRover') === 'none')  {
/**
 * After made yarn tart. Set up every data.
 * And befor onclick event occure at rover button.
 */
    return `    
        <header>
            <div class="navbar-flex">
                <div class="logo-flex" onclick="handleHome(event)"></div>
            </div>
        </header>
        <main>
            ${yourName}
            <section>
                <h3>Please select one of three Rovers!</h3>
                <p>Here is a website showing photo presented by NASA API portal.</p>
                <p>
                    This website show photos from Rover camera presented by  NASA API portal.

                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, NASA API portal is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                <div class="container" style="background-image: url(${ImageOfTheDay(state)});">
            </section>
            <section>
                <div class="wrapper-buttons">
                <h1 class="main-title">Discover Mars Rovers</h1>		
                <div class="button-container">${renderMenu(state)}</div>
                </div>
            </section>
        </main>
        <footer></footer>
        `
    }else{
        /**
         * After onclick event occure at rover button.
         */
        return `
        <header>
            <div class="navbar-flex">
                <div class="logo-flex" onclick="handleHome(event)"></div>
            </div>
        </header>
        <main>
               <section>
               <h3>Please select one of three Rovers!</h3>
               <p>Here is a website showing photo presented by NASA API portal.</p>
               <p>
                   This website show photos from Rover camera presented by  NASA API portal.

                   One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, NASA API portal is one of
                   the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                   This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                   applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                   explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                   but generally help with discoverability of relevant imagery.
               </p>
                <div class="container" style="background-image: url(${ImageOfTheDay(state)});">
            </section>
            <section>
                <div class="wrapper-buttons">
                <h1 class="main-title">Discover Mars Rovers</h1>		
                <div class="button-container">${renderMenu(state)}</div>
                </div>
            </section>
        </main>
        <div class="container-info">
        <h1 class="title">Discover everything to know about <span>${state.get('currentRover').latest_photos[0].rover.name}</span></h1>		
        <div class="gallery">${renderImages(state)}</div>
    </div>
        <footer></footer>        
        
        `
    }
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})


// ------------------------------------------------------  COMPONENTS   ------------------------------------------------------

// ------------------------------------------------------  API CALLS   ------------------------------------------------------

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome to, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}


// Pure function that renders infomation requested from the backend
const ImageOfTheDay = (state) => {
    if (!state.get('apod')) {
        getImageOfTheDay(store)
    } else if (state.get('apod').image.media_type === "video"){ 
        // fallback in case the image of the day is a video
        return `https://apod.nasa.gov/apod/image/2102/Siemiony_las_31_01_2021_1024.jpg`

    } else {
        return (`
            ${state.get('apod').image.url}
        `)
    }
}


//API call to get astronomy picture of the day 
const getImageOfTheDay = async (state) => {
    let { apod } = state;
    const response = await fetch(`http://localhost:3000/apod`)
    apod = await response.json() // get data from the promise returned by .json()
    const newState = store.set('apod', apod);
    updateStore(store, newState)
    return apod;
}


// Pure function -- component to render container for the rover buttons
const renderMenu = (state) => {
    return `<ul class="flex">${renderButtonState(state)}</ul>`
}

// Pure function -- component to render rover buttons 
const renderButtonState = (state) => {
    //turn Immutable List into a regular array with Array.from
    //get access to immutable values with .get
    return  Array.from(state.get('rovers')).map( item => 
        `<li id=${item} class="flex-item btn" onclick="handleClick(event)">
            <a ref="#"  class=""  >${capitalize(`${item}`)}</a>
        </li>`
        ).join("")
}


// Pure function -- component to render images and data
const renderImages = (state) => {
    const base = state.get('currentRover');

    // with join method returns an array without commas
    return Array.from(base.latest_photos).map( item => 
        `<div class="wrapper">
            <img src="${item.img_src}" />
            <div class="wrapper-info">
                <p><span>Image date:</span> ${item.earth_date}</p>
                <p><span>Rover:</span> ${item.rover.name}</p>
                <p><span>State of the rover:</span> ${item.rover.status}</p>
                <p><span>Launch date:</span> ${item.rover.launch_date}</p>
                <p><span>Landing date:</span> ${item.rover.landing_date}</p>
            </div>
         </div>`
        ).slice(0, 50).join("")
}



// ------------------------------------------------------  HANDLE CLICK   ------------------------------------------------------

// onclick on buttons
const handleClick = event => {
    // set id of the button clicked to a new variable
    const { id } = event.currentTarget; 
    // check if the id is included in rovers of the store
    if (Array.from(store.get('rovers')).includes(id)) {
        // get currentRover images and data from the server
        getRoverImages(id, store);
    }
    else {
        console.log(`ups!!! is not included`) 
    } 
} 

// click on logo to render home page
const handleHome = event => {
    // set currentRover to none to render home page
    const newState = store.set('currentRover', 'none');
    // updates the old state with the new information
    updateStore(store, newState);
}

// ------------------------------------------------------  UTILITY   ------------------------------------------------------

// Pure function -- capitalize words
const capitalize = word => {
    return `${word[0].toUpperCase()}${word.slice(1)}`
}


// Request to the backend to get rovers data
const getRoverImages = async (roverName, state) => {
    // set the state.currentRover to currentRover
    let { currentRover } = state
    // get data from the server
    const response = await fetch(`http://localhost:3000/rovers/${roverName}`) // get data or Response from the promise returned by fetch()
    currentRover = await response.json() // get data from the promise returned by .json()
  
    // set data from the server to Immutable 'currenRover'
    const newState = store.set('currentRover', currentRover);
    // updates the old state with the new information
    updateStore(store, newState)
    return currentRover
}
