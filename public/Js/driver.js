// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged,
    signOut, sendPasswordResetEmail,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,  
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import {
    getFirestore, collection, getDocs, limit, serverTimestamp, orderBy,
    doc, getDoc, onSnapshot, deleteDoc, addDoc, collectionGroup,
    query, where, updateDoc, setDoc, initializeFirestore, persistentLocalCache
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import {
    getFunctions, httpsCallable
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-functions.js";
import { 
    getStorage, ref, uploadBytes, getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";
import { 
    getMessaging, getToken, onMessage
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging.js";

// Add your own project details below
const firebaseConfig = {
    apiKey: "AIzaSyCllsRBlMRhgc-FWqVDhEj3SsujT-Restw",
    authDomain: "mytransitpro.firebaseapp.com",
    projectId: "mytransitpro",
    storageBucket: "mytransitpro.appspot.com",
    messagingSenderId: "250746298184",
    appId: "1:250746298184:web:3d14daf21ca47dab0edd7d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistent cache enabled
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage();
const messaging = getMessaging(app);
const functions = getFunctions(app, 'us-central1');

document.querySelectorAll('.time').forEach((timeInput) => {
    timeInput.addEventListener('click', function() {
        this.showPicker(); // This is a method in newer browsers to show the date picker
    });
});

document.querySelectorAll('.date').forEach((dateInput) => {
    dateInput.addEventListener('click', function() {
        this.showPicker(); // This is a method in newer browsers to show the date picker
    });
});









/* -----------------------------         Loader         ------------------------------------ */









async function fadeInLoader() {
    const loader = document.querySelector('header');
    loader.style.display = "flex";
    loader.classList.add('active');
    const loaderImage = loader.querySelector('img');
    loaderImage.classList.add('animate');
    updateProgressBar(10)
}

async function fadeOutLoader() {   
    completeProgressBar();
    const loader = document.querySelector('header');
    const loaderImage = loader.querySelector('img');

    setTimeout(() => {
        loader.classList.remove('active');  

        setTimeout(() => {
            loaderImage.classList.remove('animate');
            loader.style.display = "none";
        }, 500);
    }, 2000)
}

document.addEventListener('DOMContentLoaded', function() {
    const loaderImage = document.querySelector('.loader img');
    const images = [
        'Icons/color_raceCar.png',
        'Icons/color_car.png',
        'Icons/color_vehicle.png',
        'Icons/color_SUV.png',
        'Icons/color_landRover.png',
    ];

    loaderImage.addEventListener('animationiteration', function() {
        if (loaderImage.classList.contains('animate')) {
            const randomIndex = Math.floor(Math.random() * images.length);
            loaderImage.src = images[randomIndex];
        }
    });
});

// Function to update the progress bar
function updateProgressBar(percentage) {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.maxWidth = percentage + '%';
    //const loader = document.querySelector('.loader');
    //loader.style.maxWidth = percentage + '%';
}

// Function to animate the progress bar to completion
function completeProgressBar() {
    updateProgressBar(100);
    setTimeout(() => {
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.maxWidth = '0%'; // Reset for next time
        //const loader = document.querySelector('.loader');
        //loader.style.maxWidth = '0%';
    }, 1500); // Delay to show 100% completion
}

document.addEventListener('DOMContentLoaded', function() {
    const divs = document.querySelectorAll('.animate-bg div');
    const numDivs = divs.length;
    const gridSize = Math.ceil(Math.sqrt(numDivs));
    const minDistance = 100 / gridSize; // Minimum distance between divs in percentage

    function generateGridPositions() {
        const positions = [];
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                positions.push({
                    top: i * minDistance + (minDistance / 2),
                    left: j * minDistance + (minDistance / 2)
                });
            }
        }
        return positions;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function applyRandomAnimationProperties(div) {
        const animationDuration = (Math.random() * 8 + 7).toFixed(1); // Random duration between 7 and 15 seconds
        const animationDelay = (Math.random() * 5).toFixed(1); // Random delay between 0 and 5 seconds

        div.style.animationDuration = `${animationDuration}s`;
        div.style.animationDelay = `${animationDelay}s`;
    }

    function setRandomPosition(div) {
        const positions = shuffle(generateGridPositions());
        const { top, left } = positions[0];
        div.style.top = `${top}%`;
        div.style.left = `${left}%`;
    }

    divs.forEach(div => {
        applyRandomAnimationProperties(div);
        setRandomPosition(div);

        div.addEventListener('animationiteration', () => {
            setRandomPosition(div);
        });
    });
});









/* -----------------------------         Main         ------------------------------------ */









let myData;

async function mainJS() {
    onAuthStateChanged(auth, async (user) => {
        try {
            // If no user, display auth screen and sign out
            if (!user) {
                displayAuth();
                await signOut(auth); // Await added to ensure sign-out completes before returning
                fadeOutLoader();
                return;
            }

            // If a user is present, set up logout button and check authentication
            document.getElementById("logOut").addEventListener("click", async function() {
                await signOut(auth);
                displayAuth();
            });

            checkUserAuth(user);

            updateProgressBar(30)


            // ====================>   Start Up Functions   <======================


            let currentDate = new Date();

            dragMapBody();
            menuNavigation();
            mainNavigation();

            const tasks = [
                { func: () => getMyData(user), name: "getMyData" },
            ];

            try {
                const results = await Promise.all(tasks.map(async ({ func, name }) => {
                    try {
                        return await func();
                    } catch (error) {
                        console.error(`${name} failed:`, error);
                        return null; // or handle as needed for each specific case
                    }
                }));

                updateProgressBar(70)


                // ====================>   Get data   


                myData = results[0];
                console.log("myData", myData)


                // ====================>   Initial Functions   


                //  >>> Main (Home)

                try {
                    displayMyBookings(currentDate, myData, myData.vendor);
                } catch (error) {
                    console.error(`Error in displayCurrentBookings:`, error);
                }

                //  >>> Main (Book)

                try {
                    //displayCalendar(currentDate, myData.vendor, myData);
                } catch (error) {
                    console.error(`Error in displayCalendar:`, error);
                }

                //  >>> Main (Chat)

                try {
                    displayChat(currentDate, myData);
                } catch (error) {
                    console.error(`Error in displayChat:`, error);
                }

                //  >>> Main (Map) show driver on way to pick you up, and as you proceed on your trip.



                //  >>> Main (Menu)

                try {
                    displayProfileDetails(myData);
                } catch (error) {
                    console.error(`Error in displayProfileDetails:`, error);
                }


                // ====================>   Event Listeners   


                //  >>> Main (Home)



                //  >>> Main (Drivers)



                //  >>> Main (Map)

                const tripSummary = document.getElementById("tripSummary");
                const seeMore = document.getElementById("seeMore");

                document.querySelector("#moreTrips").addEventListener("click", () => {
                    try {
                        activateHTML(tripSummary, seeMore);
                        window.history.pushState({ page: "home", action: "moreTrips" }, '', "");

                        displayMoreBookings(currentDate, myData, myData.upcomingBookings, seeMore, "Upcoming");
                    } catch (error) {
                        console.error(`Error in displayMoreBookings:`, error);
                    }
                })

                document.querySelector("#moreHistory").addEventListener("click", () => {
                    try {
                        activateHTML(tripSummary, seeMore);
                        window.history.pushState({ page: "home", action: "moreHistory" }, '', "");

                        displayMoreBookings(currentDate, myData, myData.previousBookings, seeMore, "History");
                    } catch (error) {
                        console.error(`Error in displayMoreBookings:`, error);
                    }
                })                

                //  >>> Main (Customers)



                //  >>> Main (Menu)



                //  >>> History Popstate

                window.addEventListener("popstate", event => {
                    const state = event.state;
                    const { page, action } = state;

                    console.log('Page:', page);
                    console.log('Action:', action);

                    // Deactivate all navigation items and sections before activating the new one
                    deactivateAll();

                    if (action !== "auth") {
                        switch (page) {
                            case "home":
                                console.log("Home Page");
                                activateSection(0)
    
                                switch (action) {
                                    case "default":
                                        document.querySelector(".popUp-box").classList.remove("active");
                                        try {
                                            activateHTML(seeMore, tripSummary); 
                                        } catch (error) {
                                            console.error(`Error in displayMoreBookings:`, error);
                                        }
                                        break;
                                    case "moreTrips":
                                        try {
                                            activateHTML(tripSummary, seeMore);                    
                                        } catch (error) {
                                            console.error(`Error in displayMoreBookings:`, error);
                                        }
                                        break;
                                    case "moreHistory":
                                        try {
                                            activateHTML(tripSummary, seeMore, "History");
                                        } catch (error) {
                                            console.error(`Error in displayMoreBookings:`, error);
                                        }
                                        break;
                                    case "addAddress":
                                        document.querySelector(".popUp-box").classList.add("active");
                                        break;
                                    default:
                                        break;
                                }
                                break;
                            case "chat":
                                console.log("Vehicles Page");
                                activateSection(1)
                                
    
                                break;
                            case "map":
                                activateSection(2)

                                console.log(action)
                                
                                switch (action) {
                                    case "default":
                                        try {
                                            displayCurrentBooking(currentDate, myData)
                                        } catch (error) {
                                            console.error(`Error in displayCurrentBooking:`, error);
                                        }
                                        break;
                                    case "selectBooking":
                                        try {
                                            displayCurrentBooking(currentDate, myData)
                                        } catch (error) {
                                            console.error(`Error in displayCurrentBooking:`, error);
                                        }
                                        break;
                                    default:
                                        break;
                                }

                                break;
                            case "book":
                                console.log("Drivers page");
                                activateSection(2)
                              
                                switch (action) {
                                    case "default":
                                        document.querySelector(".popUp-box").classList.remove("active");
                                        break;
                                    case "selectDriverVehicle":
                                        document.querySelector(".popUp-box").classList.add("active");
                                        break;
                                    default:
                                        document.querySelector(".popUp-box").classList.remove("active");
                                        break;
                                }

                                break;
                            case "menu":
                                console.log("Menu Page");
                                menuItem.classList.add("active");
                                activateSection(4)
                            
                                break;
                            default:
                                console.log("Home Page is default");
                                window.history.replaceState({ page: "home", action: "default" }, '', window.location.pathname);
                                activateSection(0)
                                break;
                        }
                    }
                });

                window.history.replaceState({ page: "home", action: "default" }, '', window.location.pathname);

                fadeOutLoader();
                document.querySelector("footer").classList.add("active");
            } catch (error) {
                console.error(error);
            }
        } catch (error) {
            console.error(`Error during user authentication state change:`, error);
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    fadeInLoader();
    mainJS();
});

function activateHTML(hideThisBox, showThisBox) {
    // Check if showThisBox is already active
    if (showThisBox.classList.contains("active")) {
        return; // Exit early if already active
    }

    hideThisBox.classList.remove("active");

    setTimeout(() => {
        hideThisBox.style.display = "none";
        showThisBox.style.display = "flex";

        setTimeout(() => {
            showThisBox.classList.add("active");
        }, 100);
    }, 100);
}

/*document.addEventListener("DOMContentLoaded", function() {
    const addIcon = document.querySelector(".img i");
    const fileInput = document.getElementById("vehicleFile");
    const displayImage = document.getElementById("displayImage");

    addIcon.addEventListener("click", function() {
        fileInput.click();
    });

    fileInput.addEventListener("change", function(event) {
        updateImagePreview(event, displayImage);
    });
});

function updateImagePreview(event, img) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}*/

async function getMyData(user) {
    // Fetch user data
    const userQuery = query(collectionGroup(db, "drivers"), where("uid", "==", user.uid));
    const usersSnapshot = await getDocs(userQuery);

    updateProgressBar(30);

    if (usersSnapshot.empty) {
        console.log("No user found");
        return { user: null, vendor: null }; // Return null if no user is found
    }

    // Process user data
    const userDoc = usersSnapshot.docs[0];
    const userData = { id: userDoc.id, ...userDoc.data() };
    const userDocRef = userDoc.ref;
    const userDocPath = userDocRef.path;
    const vendorPath = userDocPath.split('/drivers/')[0];

    // Fetch bookings and vendor data concurrently
    const bookingPath = `${vendorPath}/drivers/${userData.id}/bookings`;
    const [bookingsSnapshot, vendorData] = await Promise.all([
        getDocs(collection(db, bookingPath)),
        getVendorData(vendorPath)
    ]);

    updateProgressBar(50);

    // Process bookings data
    const bookings = bookingsSnapshot.docs.map(bookingDoc => ({
        id: bookingDoc.id,
        ...bookingDoc.data()
    }));

    const separatedBookings = bookings.flatMap(booking => {
        // Ensure trips is an iterable or convert it to an empty array if not
        const trips = Array.isArray(booking.trips)
            ? booking.trips
            : typeof booking.trips === 'object' && booking.trips !== null
                ? Object.values(booking.trips)
                : [];

        return trips.map(trip => ({
            ...booking,
            ...trip, // Replace trips array with a single trip
            trips: undefined, // Remove the trips array from the result
            drivers: Object.values(trip.drivers || {}), // Convert drivers map to array
            vehicles: Object.values(trip.vehicles || {}) // Convert vehicles map to array
        }));
    });

    separatedBookings.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    let previousBookings = [];
    let currentBooking = null;
    let upcomingBookings = [];

    const now = new Date();

    for (const booking of separatedBookings) {
        const { startDate, status, pickUpTime, customer } = booking;

        const tripDate = new Date(startDate + 'T' + pickUpTime + ':00');
        const approved = status === 'Approved!';
        const pending = status === 'Pending...';

        if (tripDate < now) {
            const chatRef = doc(db, "chats", `${startDate} > ${customer.id}`);
            const docSnapshot = await getDoc(chatRef);
            if (docSnapshot.exists()) {
                await deleteDoc(chatRef);
                console.log('Deleted chat document:', chatRef.id);
            }
            previousBookings.push({ ...booking });
        } else if (approved) {
            if (!currentBooking || tripDate < new Date(currentBooking.startDate + 'T' + currentBooking.pickUpTime + ':00')) {
                currentBooking = { ...booking };
                upcomingBookings.push({ ...booking });
            }
        } else if (approved || pending) {
            upcomingBookings.push({ ...booking });
        }
    }

    previousBookings.sort((a, b) => new Date(b.startDate + 'T' + b.pickUpTime + ':00') - new Date(a.startDate + 'T' + a.pickUpTime + ':00'));
    upcomingBookings.sort((a, b) => new Date(a.startDate + 'T' + a.pickUpTime + ':00') - new Date(b.startDate + 'T' + b.pickUpTime + ':00'));

    return {
        ...userData,
        bookings: separatedBookings,
        previousBookings,
        currentBooking,
        upcomingBookings,
        vendor: vendorData,
    };
}

async function getVendorData(vendorPath) {
    const vendorDocRef = doc(db, vendorPath);
    const vendorSnapshot = await getDoc(vendorDocRef);

    if (!vendorSnapshot.exists()) {
        return null; // Return null if no vendor document exists
    }

    const vendorDoc = vendorSnapshot.data();
    const vendor = {
        id: vendorSnapshot.id,
        ...vendorDoc
    };

    return {
        ...vendor
    };
}










/* -----------------------------         Authentication         ------------------------------------ */









async function checkUserAuth(user) {
    if (user) {
        // Define collections and queries
        const collections = [
            { name: 'users', redirect: 'home.html' },
            { name: 'vendors', redirect: 'vendor.html' },
            { name: 'admin', redirect: 'admin.html' }
        ];

        // Perform all queries in parallel
        const queries = collections.map(({ name }) => {
            const col = collection(db, name);
            return getDocs(query(col, where("uid", "==", user.uid)));
        });

        // Wait for all queries to complete
        const results = await Promise.all(queries);

        // Check each collection for a matching document
        for (let i = 0; i < results.length; i++) {
            if (!results[i].empty) {
                console.log(`${collections[i].name.charAt(0).toUpperCase() + collections[i].name.slice(1)}!`);
                window.location.href = collections[i].redirect;
                return;
            }
        }
    } else {
        // User is signed out
        console.log("User is signed out");
    }
}

async function checkUserAuth(user) {
    if (user) {
        // Define collections and queries
        const collections = [
            { name: 'users', redirect: 'home.html' },
            { name: 'vendors', redirect: 'vendor.html' }
        ];

        // Perform all queries in parallel
        const queries = collections.map(({ name }) => {
            const col = collection(db, name);
            return getDocs(query(col, where("uid", "==", user.uid)));
        });

        // Wait for all queries to complete
        const results = await Promise.all(queries);

        // Check each collection for a matching document
        for (let i = 0; i < results.length; i++) {
            if (!results[i].empty) {
                console.log(`${collections[i].name.charAt(0).toUpperCase() + collections[i].name.slice(1)}!`);
                window.location.href = collections[i].redirect;
                return;
            }
        }

        // Check in drivers subcollections of all vendors
        const driversQuery = query(collectionGroup(db, "drivers"), where("uid", "==", user.uid));
        const driversDocs = await getDocs(driversQuery);

        if (!driversDocs.empty) {
            console.log("Driver!");
            window.location.href = "driver.html";
        }
    } else {
        // User is signed out
        console.log("User is signed out");
    }
}

function displayAuth() {
    const form = document.getElementById("form");
    form.style.display = "flex";
    setTimeout(() => {
        form.classList.add("active");
    }, 100);
}

function hideAuth() {
    const form = document.getElementById("form");
    form.classList.remove("active");
    setTimeout(() => {
        form.style.display = "none";
    }, 100);
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('bxs-lock-open') || e.target.classList.contains('bxs-lock')) {
        const inputField = e.target.closest('.input-box').querySelector('input');
        const isPassword = inputField.type === 'password';
        
        inputField.type = isPassword ? 'text' : 'password';
        e.target.classList.toggle('bxs-lock-open', isPassword);
        e.target.classList.toggle('bxs-lock', !isPassword);
    }
});

// Function to handle user login
document.getElementById('login').addEventListener("click", async (event) => {
    event.preventDefault();
    fadeInLoader();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    try {
        // Attempt to sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (user) {
            window.location.reload();
        }
    } catch (error) {
        fadeOutLoader();
        console.error("Error during login:", error);
        alert("Login failed. Please check your email and password.");
    }
});








/* -----------------------------         Main (Side Bar)         ------------------------------------ */









function toggleSideDash() {
    document.querySelector('footer').classList.toggle('inactive');
    document.querySelector('.side-dash').classList.toggle('active');
    document.querySelector('.ri-arrow-right-s-fill').classList.toggle('active');
    document.querySelector('.ri-arrow-left-s-fill').classList.toggle('active');
    document.querySelector('.ri-close-fill').classList.toggle('active');
}

document.getElementById('toggleSideDash').addEventListener('click', toggleSideDash);
document.getElementById('closeSideDash').addEventListener('click', toggleSideDash);









/* -----------------------------         Main (Home)         ------------------------------------ */









function displayMyBookings(currentDate, myData, vendor) {
    const myTrips = document.getElementById("myTrips");
    const myHistory = document.getElementById("myHistory");

    myTrips.innerHTML = "";
    myHistory.innerHTML = "";

    // Function to render bookings
    const renderBookings = (bookingsToRender, container, emptyMessage) => {
        const fragment = document.createDocumentFragment();

        if (bookingsToRender.length === 0) {
            const emptyMessageElement = document.createElement("p");
            emptyMessageElement.className = "empty";
            emptyMessageElement.textContent = emptyMessage;
            container.appendChild(emptyMessageElement);
        } else {
            bookingsToRender.forEach((booking) => {
                const nameSurname = `${booking.customer?.name ?? 'Name'} ${booking.customer?.surname ?? 'Surname'}`.trim();
                const lastDropOff = booking.dropOffAddresses?.[booking.dropOffAddresses.length - 1];
                const dropOffImage = lastDropOff?.image ?? "Images/gallery.png";
                const dropOffAddress = lastDropOff?.address ?? "Where To?";

                const createdLi = document.createElement("li");
                createdLi.innerHTML = `
                    <div class="img">
                        <img src="${dropOffImage}" alt="Map Location Image">
                    </div>

                    <div class="details">
                        <h1 class="to"><b>To:</b> ${dropOffAddress}</h1>
                        <h3 class="from"><b>Date:</b> ${booking.startDate}</h3>
                        <div class="flex-box">
                            <h5 class="driver">Customer: <br>${nameSurname}</h5>
                            <h5 class="vehicle">Vehicle: <br>${booking.vehicle?.brand || ""} ${booking.vehicle?.model || ""}</h5>
                        </div>

                        <p class="price"><b>Price:</b>R${booking.price.total}</p>
                    </div>

                    <i class="ri-arrow-right-s-line" style="display: none"></i>
                `;

                if (booking.status === "Pending...") {
                    createdLi.classList.add("inactive");
                }

                if (emptyMessage === "No previous bookings.") {
                    createdLi.querySelector(".ri-arrow-right-s-line").style.display = "flex";
    
                    createdLi.addEventListener("click", () => {
                            fadeInLoader();
                            window.history.pushState({ page: "map", action: "selectBooking" }, '', "");
                            activateSection(2);
                            openBooking(currentDate, myData, booking);
                    });
                }

                fragment.appendChild(createdLi);
            });
        }

        container.appendChild(fragment);
    };

    // Separate bookings into previous and upcoming
    const previousBookings = myData.previousBookings.slice(0, 3);
    const upcomingBookings = myData.upcomingBookings.slice(0, 2);

    // Render bookings
    renderBookings(upcomingBookings, myTrips, "No upcoming jobs...");
    renderBookings(previousBookings, myHistory, "No previous jobs.");
}

function displayMoreBookings(currentDate, myData, bookings, container, title) {
    container.innerHTML = `
        <div class="title">
            <h1>${title}:</h1>
        </div>
    `;
    
    if (bookings.length === 0) {
        const emptyMessageElement = document.createElement("p");
        emptyMessageElement.className = "empty";
        emptyMessageElement.textContent = "No upcoming jobs...";
        container.appendChild(emptyMessageElement);
    } else {
        const fragment = document.createDocumentFragment();

        bookings.forEach((booking) => {
            const nameSurname = `${booking.customer?.name ?? 'Name'} ${booking.customer?.surname ?? 'Surname'}`.trim();
            const lastDropOff = booking.dropOffAddresses?.[booking.dropOffAddresses.length - 1];
            const dropOffImage = lastDropOff?.image ?? "Images/gallery.png";
            const dropOffAddress = lastDropOff?.address ?? "Where To?";

            const createdLi = document.createElement("li");
            createdLi.innerHTML = `
                <div class="img">
                    <img src="${dropOffImage}" alt="Map Location Image">
                </div>
                <div class="details">
                    <h1 class="to"><b>To:</b> ${dropOffAddress}</h1>
                    <h3 class="from"><b>Date:</b> ${booking.bookingId}</h3>
                    <div class="flex-box">
                        <h5 class="driver">Driver: <br>${nameSurname}</h5>
                        <h5 class="vehicle">Vehicle: <br>${booking.vehicle?.name || ""}</h5>
                    </div>
                    <p class="price"><b>Price:</b> R${booking.price}</p>
                </div>
                <i class="ri-arrow-right-s-line" style="display: none"></i>
            `;

            if (booking.status === "Pending...") {
                createdLi.classList.add("inactive");
            }

            if (title !== "History") {
                createdLi.querySelector(".ri-arrow-right-s-line").style.display = "flex";

                createdLi.addEventListener("click", () => {
                        fadeInLoader();
                        window.history.pushState({ page: "map", action: "selectBooking" }, '', "");
                        activateSection(2);
                        openBooking(currentDate, myData, booking);
                });
            }

            fragment.appendChild(createdLi);
        });

        container.appendChild(fragment);
    }
}

function openBooking(currentDate, myData, booking) {
    updateProgressBar(10);

    const { 
        vehicle: {
            image: vehicleImg = "Images/land-rover.png",
            licence = "Licence Plate"
        } = {}, 
        driver: {
            image: driverImg = "Images/gallery.png",
            name: nameSurname = "Driver's Name",
            number = "+27 00 000 0000",
            rating = "0"
        } = {}, 
        dropOffAddress = "", 
        pickUpAddress = "",
        eta = "",
        price = ""
    } = booking;

    updateProgressBar(40);

    const body = document.querySelector("#map .body");
    body.innerHTML = `
        <div class="img" id="vehicleImg">
            <img src="${vehicleImg}" alt="Vehicle Image">
        </div>
        <h1 class="licence">${licence}</h1>
        <div class="driver">
            <div class="img" id="driverImg">
                <img src="${driverImg}" alt="Driver Image">
            </div>
            <div class="details">
                <h3 class="name">${nameSurname}</h3>
                <h5 class="tel">${number}</h5>
                <p class="rating">${rating} <i class="ri-shield-star-fill"></i></p>
            </div>
            <a href="tel:${number}"><i class="ri-phone-fill"></i></a>
        </div>
        <ul class="more-info"></ul>
    `;

    updateProgressBar(70);

    const moreInfo = body.querySelector(".more-info");
    const createList = (icon, title, data) => {
        moreInfo.insertAdjacentHTML('beforeend', `
            <li>
                <div class="icon">
                    <i class="${icon}"></i>
                </div>
                <div class="box">
                    <h5>${title}</h5>
                    <p>${data}</p>
                </div>
            </li>
        `);
    };

    createList("ri-price-tag-3-line", "Price:", `R${price}`);
    createList("ri-map-pin-2-line", "Picked Up At:", pickUpAddress);
    createList("ri-map-pin-2-fill", "Dropped Off At:", dropOffAddress);
    createList("ri-timer-line", "Estimated Time Of Arrival:", eta);

    fadeOutLoader();
}







/* -----------------------------         Main (Chat)         ------------------------------------ */









//  >>>   Chat history scrolled to the bottom   <<<
document.addEventListener("DOMContentLoaded", function() {
    var chatBody = document.querySelector("#chat .body");
    chatBody.scrollTop = chatBody.scrollHeight;
});

function displayChat(currentDate, myData) {
    const trip = myData.currentBooking;

    const header = document.querySelector("#chat .header");
    const body = document.querySelector("#chat .body");
    const footer = document.querySelector("#chat .footer");
    const chatIcon = document.getElementById("newMsg");

    let hasUnreadMessage;

    if (trip) {
        const startDate = trip.startDate;
        const customer = trip.customer; // Assuming the customer details are within trip.customer
        const drivers = trip.drivers;
        const driverId = myData.id; // Assuming myData.id is the driver's ID

        const chatRef = collection(db, "chats", `${startDate} > ${customer.id}`, "messages");

        // Always show customer details in the header
        header.innerHTML = `
            <div class="img">
                <img src="${customer.image || 'Images/gallery.png'}" alt="Customer Profile Picture" style="object-fit: cover">
            </div>
            <div class="info">
                <div class="name">${customer.name} ${customer.surname}</div>
                <div class="status"><i class="ri-signal-tower-fill"></i> Customer</div>
            </div>
        `;

        // Query the messages collection within the chat document and order by createdAt
        const messagesQuery = query(chatRef, orderBy('createdAt', 'asc'));

        onSnapshot(messagesQuery, snapshot => {
            body.innerHTML = '';
            let lastDate = null; // Track the date of the last message for date separation

            snapshot.forEach(doc => {
                const message = doc.data();
                const messageDate = new Date(message.createdAt.seconds * 1000); // Assuming `createdAt` is a Firestore Timestamp
                const formattedMessageDate = messageDate.toDateString();

                // If the message date is different from the last one, add a new date element
                if (lastDate !== formattedMessageDate) {
                    const dateElement = document.createElement('div');
                    dateElement.classList.add('message-date');
                    dateElement.textContent = formattedMessageDate;
                    body.appendChild(dateElement);
                    lastDate = formattedMessageDate;
                }

                const messageElement = document.createElement('div');
                messageElement.classList.add("box");

                // Differentiate between the current driver, customer, and other drivers
                if (message.senderId === driverId) {
                    messageElement.classList.add("me"); // Current driver's message
                } else if (message.senderId === customer.id) {
                    messageElement.classList.add("you"); // Customer's message

                    const customerInfo = document.createElement('div');
                    customerInfo.classList.add('other-info');
                    customerInfo.textContent = `${customer.name} ${customer.surname}`;
                    messageElement.appendChild(customerInfo);
                } else if (drivers[message.senderId]) {
                    messageElement.classList.add("you"); // Another driver's message
                    
                    const otherDriver = drivers[message.senderId];
                    const driverInfo = document.createElement('div');
                    driverInfo.classList.add('other-info');
                    driverInfo.textContent = `${otherDriver.name} ${otherDriver.surname}`;
                    messageElement.appendChild(driverInfo);
                }

                const p = document.createElement("p");
                p.textContent = message.text;
                messageElement.appendChild(p);

                const formattedCreatedAt = formatCreatedAt(message.createdAt);
                const timeDiv = document.createElement("div");
                timeDiv.className = "time";
                timeDiv.textContent = formattedCreatedAt;
                messageElement.appendChild(timeDiv);

                body.appendChild(messageElement);

                // Check if the message is unread
                if (message.senderId !== driverId) {
                    hasUnreadMessage = true;
                }
            });

            // Update chat icon based on unread messages
            if (hasUnreadMessage) {
                chatIcon.classList.add('active');
            } else {
                chatIcon.classList.remove('active');
            }
        });

        // Add event listener for send button
        const sendMessage = () => {
            const messageInput = footer.querySelector("textarea");
            const messageText = messageInput.value.trim();

            if (messageText) {
                addDoc(chatRef, {
                    text: messageText,
                    senderId: driverId,
                    createdAt: new Date()
                })
                .then(() => {
                    messageInput.value = ''; // Clear the input box
                })
                .catch(error => {
                    console.error("Error sending message: ", error);
                });
            }
        };

        // Add event listener for send button
        footer.querySelector("button").addEventListener('click', sendMessage);

        // Add event listener for Enter key in the text area
        footer.querySelector("textarea").addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });
    } else {
        // No trip is currently active
        header.innerHTML = `
            <div class="img">
                <img src="Images/gallery.png" alt="Customer Profile Picture">
            </div>
            <div class="info">
                <div class="name">Customer Name and Surname</div>
                <div class="status"><i class="ri-signal-tower-fill"></i></div>
            </div>
        `;

        body.innerHTML = "";

        const msg = document.createElement("div");
        msg.classList.add("box");
        msg.classList.add("me");
        msg.innerHTML = `
            <p>To communicate with the customer, you need an approved booking!</p>
        `;

        body.appendChild(msg);

        const textArea = footer.querySelector("textarea");
        textArea.disabled = true;
    }
}

function formatCreatedAt(createdAt) {
    if (!createdAt || !createdAt.seconds) {
        return '';
    }

    const now = new Date();
    const messageDate = new Date(createdAt.seconds * 1000); // Firestore Timestamp to JS Date
    const diffInSeconds = (now.getTime() - messageDate.getTime()) / 1000; // Time difference in seconds
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInSeconds / 3600);

    // Less than 24 hours ago
    if ((diffInHours * -1) < 24) {
        const hours = messageDate.getHours().toString().padStart(2, '0');
        const minutes = messageDate.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    return messageDate.toDateString();
}









/* -----------------------------         Main (Map)         ------------------------------------ */









function dragMapBody() {
    const body = document.querySelector('#map .body');
    const headerImg = document.querySelector('#map .header .img img');
    const moreInfo = document.querySelector('#map .body .more-info');
    let startY = 0;
    let startTop = 0;
    let isDragging = false;
    const initialTop = parseInt(window.getComputedStyle(body).top, 10);
    headerImg.style.filter = `grayscale(60%)`;

    function getMaxDrag() {
        return window.innerWidth < 500 ? 155 : 200;
    }

    function onMouseDown(event) {
        if (moreInfo.contains(event.target)) return;
        startY = event.clientY;
        startTop = parseInt(window.getComputedStyle(body).top, 10);
        isDragging = true;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    function onTouchStart(event) {
        if (moreInfo.contains(event.target)) return;
        startY = event.touches[0].clientY;
        startTop = parseInt(window.getComputedStyle(body).top, 10);
        isDragging = true;
        document.addEventListener('touchmove', onTouchMove);
        document.addEventListener('touchend', onTouchEnd);
    }

    function onMouseMove(event) {
        if (!isDragging) return;
        const newTop = startTop + (event.clientY - startY);
        const maxDrag = getMaxDrag();
        if (newTop >= initialTop && newTop <= initialTop + maxDrag) {
            body.style.top = `${newTop}px`;
            updateGreyscale(newTop - initialTop, maxDrag);
        }
    }

    function onTouchMove(event) {
        if (!isDragging) return;
        const newTop = startTop + (event.touches[0].clientY - startY);
        const maxDrag = getMaxDrag();
        if (newTop >= initialTop && newTop <= initialTop + maxDrag) {
            body.style.top = `${newTop}px`;
            updateGreyscale(newTop - initialTop, maxDrag);
        }
    }

    function updateGreyscale(dragDistance, maxDrag) {
        const greyscaleValue = 60 - (dragDistance / maxDrag) * 60;
        headerImg.style.filter = `grayscale(${greyscaleValue}%)`;
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    function onTouchEnd() {
        isDragging = false;
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
    }

    body.addEventListener('mousedown', onMouseDown);
    body.addEventListener('touchstart', onTouchStart);
};

function displayCurrentBooking(currentDate, myData) {
    const body = document.querySelector("#map .body");
    const currentBooking = myData.currentBooking || {};

    const {
        vehicle: { image: vehicleImg = "Images/land-rover.png", licence = "Licence Plate" } = {},
        driver: {
            image: driverImg = "Images/gallery.png",
            name: nameSurname = "Driver's Name",
            number = "+27 00 000 0000",
            rating = "0"
        } = {},
        price = "",
        pickUpAddress = "",
        dropOffAddress = "",
        eta = ""
    } = currentBooking;

    body.innerHTML = `
        <div class="img" id="vehicleImg">
            <img src="${vehicleImg}" alt="Vehicle Image">
        </div>
        <h1 class="licence">${licence}</h1>
        <div class="driver">
            <div class="img" id="driverImg">
                <img src="${driverImg}" alt="Driver Image">
            </div>
            <div class="details">
                <h3 class="name">${nameSurname}</h3>
                <h5 class="tel">${number}</h5>
                <p class="rating">${rating} <i class="ri-shield-star-fill"></i></p>
            </div>
            <a href="tel:${number}"><i class="ri-phone-fill"></i></a>
        </div>
        <ul class="more-info"></ul>
    `;

    const moreInfo = body.querySelector(".more-info");

    const createList = (icon, title, data) => {
        moreInfo.insertAdjacentHTML('beforeend', `
            <li>
                <div class="icon">
                    <i class="${icon}"></i>
                </div>
                <div class="box">
                    <h5>${title}</h5>
                    <p>${data}</p>
                </div>
            </li>
        `);
    };

    createList("ri-price-tag-3-line", "Price:", `R${price}`);
    createList("ri-map-pin-2-line", "Picked Up At:", pickUpAddress);
    createList("ri-map-pin-2-fill", "Dropped Off At:", dropOffAddress);
    createList("ri-timer-line", "Estimated Time Of Arrival:", eta);
}









/* -----------------------------         Main (Customers)         ------------------------------------ */



















/* -----------------------------         Main (Menu)         ------------------------------------ */









function menuNavigation() {
    const btns = document.querySelectorAll("#menu .body .page .middle li");
    const logOutBtn = document.getElementById('logOut');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const btnId = btn.id;
            const pageId = btnId.replace('Btn', '');

            const activePage = document.querySelector("#menu .body .page.active");
            const matchingPage = document.getElementById(pageId);
            activateHTML(activePage, matchingPage);
            window.history.pushState({ page: "menu", action: pageId }, '', '');
        });
    });

    logOutBtn.addEventListener("click", async function() {
        const activePage = document.getElementById("#menu .body .page.active");
        const matchingPage = document.getElementById("form");

        activateHTML(activePage, matchingPage);
    });
}

function displayProfileDetails(myData) {
    document.querySelector("#home .header h3").textContent = `${myData.name} ${myData.surname}`;

    const header = document.querySelector(".body #profileMenu .top");
    const pfp = myData.image || "Images/gallery.png";

    header.innerHTML = `
        <div class="img">
            <img src=${pfp} alt="Profile Picture">
        </div>

        <h1>${myData.name} ${myData.surname}</h1>
        <h5>${myData.type} Transport</h5>
    `;
}









/* -----------------------------         Footer         ------------------------------------ */









function mainNavigation() {
    const navItems = document.querySelectorAll(".side-nav li");
    const menuItem = document.querySelector("#menuItem");
    const sections = document.querySelectorAll("main section");
    const pageNames = ["home", "vendors", "drivers", "vehicles", "menu"];

    // Combine navItems and menuItem into a single array
    const allNavItems = [...navItems, menuItem];

    // Add click event listeners to each navigation item
    allNavItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            // Deactivate all navigation items, including menuItem
            deactivateAllSections();

            // Activate the clicked nav item
            item.classList.add("active");

            // Activate the corresponding section
            activateHTML(document.querySelector("section.active"), sections[index]);

            // Determine the page name for history state
            const pageName = pageNames[index] || "home"; // Default to "home" if index is out of range
            window.history.pushState({ page: pageName, action: "default" }, '', "");
        });
    });
}

const navItems = document.querySelectorAll(".side-nav li");
const sections = document.querySelectorAll("main section");
const menuItem = document.querySelector("#menuItem");

// Function to deactivate all navigation items and sections
const deactivateAll = () => {
    menuItem.classList.remove("active");
    navItems.forEach(item => item.classList.remove("active"));
};

// Function to activate a specific navigation item and section by index
const activateSection = index => {
    navItems[index]?.classList.add("active");
    activateHTML(document.querySelector("section.active"), sections[index])
};