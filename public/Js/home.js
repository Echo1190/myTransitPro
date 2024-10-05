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
        progressBar.style.maxWidth = '0%';
    }, 2500);
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
let bookingDate;
let autoComplete;
let pickMeUp;
let dropMeOff = [];

let selectedAddress = {
    pickUpAddress: null,
    dropOffAddresses: []
};

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

            updateProgressBar(10)


            // ====================>   Start Up Functions   <======================


            let currentDate = new Date();

            initAutocomplete();
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
                    displayTopAddresses(myData, myData.topAddresses);
                } catch (error) {
                    console.error(`Error in displayTopAddresses:`, error);
                }

                try {
                    displayMyBookings(currentDate, myData, myData.vendor);
                } catch (error) {
                    console.error(`Error in displayCurrentBookings:`, error);
                }

                //  >>> Main (Chat)

                try {
                    displayChat(currentDate, myData);
                } catch (error) {
                    console.error(`Error in displayChat:`, error);
                }

                //  >>> Main (Map)

                try {
                    displayCurrentBooking(currentDate, myData)
                } catch (error) {
                    console.error(`Error in displayCurrentBooking:`, error);
                }
            
                //  >>> Main (Book)

                try {
                    displayCalendar(currentDate, myData.vendor, myData);
                } catch (error) {
                    console.error(`Error in displayCalendar:`, error);
                }

                //  >>> Main (Menu)

                try {
                    displayProfileDetails(myData);
                } catch (error) {
                    console.error(`Error in displayProfileDetails:`, error);
                }


                // ====================>   Event Listeners   


                //  >>> Main (Home)



                //  >>> Main (Chat)



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

                //  >>> Main (Book)

                document.getElementById("addStop").addEventListener("click", () => {
                    addStop();
                });

                document.getElementById("bookNow").addEventListener("click", () => {
                    try {
                        bookNow(myData);
                    } catch (error) {
                        console.error(`Error in bookNow:`, error);
                    }
                });

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

                                const activePage = document.querySelector("#home .page.active");
                                const tripSummary = document.getElementById("tripSummary");
                                const seeMore = document.getElementById("seeMore");
                                const selectBooking = document.getElementById("selectBooking");
    
                                switch (action) {
                                    case "default":
                                        document.querySelector(".popUp-box").classList.remove("active");
                                        activateHTML(activePage, tripSummary);
                                        break;
                                    case "seeMore":
                                        document.querySelector(".popUp-box").classList.remove("active");
                                        activateHTML(activePage, seeMore);
                                        break;
                                    case "moreHistory":
                                        try {
                                            activateHTML(tripSummary, seeMore, "History");
                                        } catch (error) {
                                            console.error(`Error in displayMoreBookings:`, error);
                                        }
                                        break;
                                    case "selectBooking":
                                        document.querySelector(".popUp-box").classList.remove("active");
                                        activateHTML(activePage, selectBooking);
                                        break;
                                    case "addAddress":
                                        document.querySelector(".popUp-box").classList.add("active");
                                        break;
                                    default:
                                        break;
                                }
                                break;
                            case "book":
                                console.log("Drivers page");
                                activateSection(1)
                                
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
                            case "chat":
                                console.log("Vehicles Page");
                                activateSection(3)

                                document.querySelector("#chat .header").classList.add("active");
                                const activeChatPage = document.querySelector("#chat .page.active");
                                const seeMoreInfo = document.querySelector("#chat .body #seeMoreInfo");
                                const chatBox = document.querySelector("#chat .body #chatBox");
    
                                switch (action) {
                                    case "default":
                                        activateHTML(activeChatPage, chatBox);
                                        break;
                                    case "seeMore":
                                        document.querySelector("#chat .header").classList.remove("active");
                                        activateHTML(activeChatPage, seeMoreInfo);
                                        break;
                                    default:
                                        activateHTML(activeChatPage, chatBox);
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
    const userQuery = query(collection(db, 'users'), where("uid", "==", user.uid), limit(1));
    const usersSnapshot = await getDocs(userQuery);

    updateProgressBar(30);

    if (usersSnapshot.empty) {
        console.log("No user found");
        return { user: null, vendor: null }; // Return null if no user is found
    }

    // Process user data
    const userDoc = usersSnapshot.docs[0];
    const userData = { id: userDoc.id, ...userDoc.data() };

    // Fetch bookings and vendor data concurrently
    const bookingPath = `users/${userData.id}/bookings`;
    const [bookingsSnapshot, vendorData] = await Promise.all([
        getDocs(collection(db, bookingPath)),
        getVendorData(userData.vendor)
    ]);

    updateProgressBar(50);

    // Process bookings data
    const bookings = bookingsSnapshot.docs.map(bookingDoc => ({
        id: bookingDoc.id,
        ...bookingDoc.data()
    }));

    // Split trips into separate bookings
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

    separatedBookings.sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateB - dateA;
    });

    let previousBookings = [];
    let currentBooking = null;
    let upcomingBookings = [];
    let dropOffAddressCount = {};

    const now = new Date();

    for (const booking of separatedBookings) {
        const { updatedAt, drivers, vehicles, price } = booking;

        const tripDate = new Date(booking.startDate + 'T' + booking.pickUpTime + ':00'); // Adjusted to handle the format correctly

        const status = booking.status;
        const approved = status === 'Approved!';
        const pending = status === 'Pending...';

        // Count drop-off addresses if defined
        if (booking.dropOffAddresses) {
            booking.dropOffAddresses.forEach(address => {
                const dropOffAddress = address.address;
                if (dropOffAddressCount[dropOffAddress]) {
                    dropOffAddressCount[dropOffAddress].count++;
                } else {
                    dropOffAddressCount[dropOffAddress] = { count: 1, address };
                }
            });
        }

        if (tripDate < now && tripDate.toDateString() !== now.toDateString()) {
            if (drivers[0] && drivers[0].id) {
                const chatRef = doc(db, "chats", `${booking.bookingId} > ${userData.id}`);
                const docSnapshot = await getDoc(chatRef);
                if (docSnapshot.exists()) {
                    await deleteDoc(chatRef);
                    console.log('Deleted chat document:', chatRef.id);
                }
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

    previousBookings.sort((a, b) => {
        const dateA = new Date(a.startDate + 'T' + a.pickUpTime + ':00');
        const dateB = new Date(b.startDate + 'T' + b.pickUpTime + ':00');
        return dateB - dateA;
    });

    upcomingBookings.sort((a, b) => {
        const dateA = new Date(a.startDate + 'T' + a.pickUpTime + ':00');
        const dateB = new Date(b.startDate + 'T' + a.pickUpTime + ':00');
        return dateB - dateA;
    });

    // Get top 8 most used drop-off addresses
    const topAddresses = Object.values(dropOffAddressCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)
        .map(({ address }) => address);

    return {
        ...userData,
        bookings: separatedBookings,
        previousBookings,
        currentBooking,
        upcomingBookings,
        vendor: vendorData,
        topAddresses
    };
}

async function getVendorData(user) {
    const vendorCollectionRef = collection(db, 'vendors');
    const vendorQuery = query(vendorCollectionRef, where("uid", "==", user));
    const vendorsSnapshot = await getDocs(vendorQuery);

    if (vendorsSnapshot.empty) {
        return null; // Return null if no vendor is found
    }

    const vendorDoc = vendorsSnapshot.docs[0];
    const vendor = {
        id: vendorDoc.id,
        ...vendorDoc.data()
    };

    const vehicleCollectionRef = collection(db, `vendors/${vendorDoc.id}/vehicles`);
    const driverCollectionRef = collection(db, `vendors/${vendorDoc.id}/drivers`);
    
    const [vehicleSnapshot, driverSnapshot] = await Promise.all([
        getDocs(vehicleCollectionRef),
        getDocs(driverCollectionRef)
    ]);
    
    const vehicles = vehicleSnapshot.docs
        .map(vehicleDoc => ({
            id: vehicleDoc.id,
            ...vehicleDoc.data()
        }))
        .filter(vehicle => !vehicle.deleted);
    
    const drivers = driverSnapshot.docs
        .map(driverDoc => ({
            id: driverDoc.id,
            ...driverDoc.data()
        }))
        .filter(driver => !driver.deleted);

    // Sort vehicles and drivers by status, with "Free!" status first
    vehicles.sort((a, b) => (a.status === "Free!" ? -1 : b.status === "Free!" ? 1 : 0));
    drivers.sort((a, b) => (a.status === "Free!" ? -1 : b.status === "Free!" ? 1 : 0));

    // Calculate average rating for each driver
    const driversWithAverageRating = drivers.map(driver => {
        const { rating } = driver;
        const totalRatings = rating.reduce((sum, value) => sum + value, 0);
        const weightedSum = rating.reduce((sum, value, index) => sum + (value * index), 0);
        const averageRating = totalRatings > 0 ? (weightedSum / totalRatings) : 0;

        return {
            ...driver,
            averageRating
        };
    });

    return {
        ...vendor,
        vehicles,
        drivers: driversWithAverageRating
    };
}

async function validateStatus(colName, object, vendor, date) {
    try {
        const ref = doc(db, "vendors", vendor.id, colName, object.id, "bookings", date);
        
        // Fetch the document by its ID (date)
        const docSnapshot = await getDoc(ref);
        
        // Check if the document exists
        if (docSnapshot.exists()) {
            return false; // Document with the specified ID exists
        } else {
            return true; // Document with the specified ID does not exist
        }
    } catch (error) {
        console.error("Error validating status:", error);
        throw error;
    }
}









/* -----------------------------         Authentication         ------------------------------------ */









async function checkUserAuth(user) {
    if (user) {
        // Define collections and queries
        const collections = [
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

        // Check in drivers subcollections of all vendors
        const driversQuery = query(collectionGroup(db, "drivers"), where("uid", "==", user.uid));
        const driversDocs = await getDocs(driversQuery);

        if (!driversDocs.empty) {
            console.log("Driver!");
            window.location.href = "driver.html";
        } else {
            // Handle case where user document does not exist in any collection
            console.log("User document does not exist in any collection");
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









const tripSummary = document.getElementById("tripSummary");
const selectBooking = document.getElementById("selectBooking");

function displayTopAddresses(myData, topAddresses) {
    const swiperContainer = document.querySelector(".frequent-addresses");
    const listContainer = document.getElementById("addressList");

    const createSlide = (className, label, address) => `
        <swiper-slide class="${className}-slide"><i class="ri-map-pin-2-fill"></i><p>${label}</p></swiper-slide>
    `;
    
    const createListItem = (className, label, address) => `
        <li class="${className}-item">
            <div class="icon"><i class="ri-map-pin-2-fill"></i></div>
            <div class="box"><h5>${label} :</h5><p>${address}</p></div>
        </li>
    `;

    const handleAddressClick = (address, title, activateSectionOnClick = true) => {
        console.log("Clicked on:", address);
        if (address) {
            clickAddress(address, activateSectionOnClick);
        } else {
            addAddress(title);
        }
    };

    swiperContainer.innerHTML = `
        ${createSlide("home", "Home", myData.homeAddress.address)}
        ${createSlide("work", "Work", myData.workAddress.address)}
    `;

    listContainer.innerHTML = `
        ${createListItem("home", "Home", myData.homeAddress.address)}
        ${createListItem("work", "Work", myData.workAddress.address)}
    `;

    swiperContainer.querySelector('.home-slide').addEventListener("click", () => handleAddressClick(myData.homeAddress, "Home"));
    swiperContainer.querySelector('.work-slide').addEventListener("click", () => handleAddressClick(myData.workAddress, "Work"));
    listContainer.querySelector('.home-item').addEventListener("click", () => handleAddressClick(myData.homeAddress, "Home", false));
    listContainer.querySelector('.work-item').addEventListener("click", () => handleAddressClick(myData.workAddress, "Work", false));

    const slidesFragment = document.createDocumentFragment();
    const listFragment = document.createDocumentFragment();

    topAddresses.forEach((address) => {
        const slide = document.createElement("swiper-slide");
        slide.innerHTML = `<i class="ri-map-pin-2-fill"></i><p>${address.name}</p>`;
        slide.addEventListener("click", () => clickAddress(address, true));
        slidesFragment.appendChild(slide);

        const item = document.createElement("li");
        item.innerHTML = `
            <div class="icon"><i class="ri-map-pin-2-fill"></i></div>
            <div class="box"><h5>${address.name} :</h5><p>${address.address}</p></div>
        `;
        item.addEventListener("click", () => clickAddress(address, false));
        listFragment.appendChild(item);
    });

    swiperContainer.appendChild(slidesFragment);
    listContainer.appendChild(listFragment);

    function clickAddress(address, activateSectionOnClick = true) {
        if (activateSectionOnClick) {
            deactivateAll();
            activateSection(1);
            window.history.pushState({ page: "book", action: "default" }, '', "");
        }
    
        const dropOffInputs = document.querySelectorAll(".dropOff");
        const lastDropOffInput = dropOffInputs[dropOffInputs.length - 1];
        
        // Check if the last input is empty
        if (address && (!lastDropOffInput.value || lastDropOffInput.value.trim() === "")) {
            // Update the last empty drop-off input
            lastDropOffInput.value = address.address;
            const index = dropOffInputs.length - 1; // Use the current index
            selectedAddress.dropOffAddresses[index] = {
                placeId: address.placeId,
                name: address.name,
                address: address.address,
                geometry: address.geometry,
                image: address.image
            };
        } else {
            // If the last input is not empty, create a new stop
            addStop(address.address);
    
            // Add the new stop to the selectedAddress array
            selectedAddress.dropOffAddresses.push({
                placeId: address.placeId,
                name: address.name,
                address: address.address,
                geometry: address.geometry,
                image: address.image
            });
        }
    
        console.log("Updated selectedAddress:", selectedAddress);
    }

    function addAddress(title) {
        document.querySelector(".popUp-box").classList.add("active");
        const popUp = document.querySelector(".popUp-box .popUp");
        popUp.innerHTML = `
            <h1>Add ${title} Address</h1>
            <div class="input-box">
                <input type="search" id="addAddress" placeholder="" required>
                <i class="ri-search-eye-line"></i>
                <span>Search Address . . .</span>
            </div>
        `;

        const input = popUp.querySelector("#addAddress");
        const autocomplete = new google.maps.places.Autocomplete(input, {
            types: ['geocode'],
            componentRestrictions: { country: 'ZA' },
            fields: ['place_id', 'geometry', 'name', 'formatted_address', 'photos']
        });

        const listenerType = title === "Home" ? "addHome" : "addWork";
        addPlaceChangedListener(autocomplete, input, listenerType);
        window.history.pushState({ page: "home", action: "addAddress" }, '', "");
    }
}

function displayMyBookings(currentDate, myData, vendor) {
    const myTrips = document.getElementById("myTrips");
    const myHistory = document.getElementById("myHistory");

    myTrips.innerHTML = "";
    myHistory.innerHTML = "";

    const renderBookingList = (bookings, container, emptyMessage) => {
        if (bookings.length === 0) {
            container.innerHTML = `<p class="empty">${emptyMessage}</p>`;
            return;
        }

        const fragment = document.createDocumentFragment();

        bookings.forEach((booking) => {
            const nameSurname = `${booking.drivers[0]?.name ?? 'Name'} ${booking.drivers[0]?.surname ?? 'Surname'}`.trim();
            const lastDropOff = booking.dropOffAddresses?.[booking.dropOffAddresses.length - 1];
            const dropOffImage = lastDropOff?.image ?? "Images/gallery.png";
            const dropOffAddress = lastDropOff?.name;

            const vehicle = booking?.vehicles[0] || {};
            const {
                brand = "Brand",
                model = "Model",
            } = vehicle;

            const createdLi = document.createElement("li");
            createdLi.innerHTML = `
                <div class="img">
                    <img src="${dropOffImage}" alt="Map Location Image">
                </div>
                <div class="details">
                    <h1 class="to"><b>To:</b> ${dropOffAddress}</h1>
                    <h3 class="from"><b>Date:</b> ${booking.startDate}</h3>
                    <div class="flex-box">
                        <h5 class="driver">Driver: <br>${nameSurname}</h5>
                        <h5 class="vehicle">Vehicle: <br>${brand} ${model}</h5>
                    </div>
                    <p class="price"><b>Price:</b> R${booking.price?.total || 0}</p>
                </div>
                <i class="ri-arrow-right-s-line"></i>
            `;

            if (booking.status === "Pending...") {
                createdLi.classList.add("inactive");
            }

            createdLi.addEventListener("click", () => {
                activateHTML(tripSummary, selectBooking);
                window.history.pushState({ page: "home", action: "selectBooking" }, '', "");
                openBooking(currentDate, myData, booking);
            });

            fragment.appendChild(createdLi);
        });

        container.appendChild(fragment);
    };

    renderBookingList(myData.upcomingBookings.slice(0, 2), myTrips, "No upcoming bookings...");
    renderBookingList(myData.previousBookings.slice(0, 3), myHistory, "No previous bookings.");
}

function displayMoreBookings(currentDate, myData, bookings, container, title) {
    container.innerHTML = `
        <div class="title">
            <h1>${title}:</h1>
        </div>
    `;

    const renderBookingList = (bookings, container) => {
        if (bookings.length === 0) {
            container.innerHTML += `<p class="empty">No upcoming bookings...</p>`;
            return;
        }

        const fragment = document.createDocumentFragment();

        bookings.forEach((booking) => {
            const nameSurname = `${booking.driver?.name ?? 'Name'} ${booking.driver?.surname ?? 'Surname'}`.trim();
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
                <i class="ri-arrow-right-s-line"></i>
            `;

            if (booking.status === "Pending...") {
                createdLi.classList.add("inactive");
            }

            createdLi.addEventListener("click", () => {
                activateHTML(tripSummary, selectBooking);
                window.history.pushState({ page: "home", action: "selectBooking" }, '', "");
                openBooking(currentDate, myData, booking);
            });

            fragment.appendChild(createdLi);
        });

        container.appendChild(fragment);
    };

    renderBookingList(bookings, container);
}

function openBooking(currentDate, myData, booking, valid) {
    console.log("booking", booking);

    // Assign default empty arrays if vehicle or driver are null or undefined
    const vehicles = booking?.vehicles || [{}];
    const drivers = booking?.drivers || [{}];

    const dropOffAddresses = booking?.dropOffAddresses || [];
    const pickUpAddress = booking?.pickUpAddress || {};
    const eta = booking?.eta || "";
    const price = booking?.price.total || "0";

    const dropOffAddressNames = dropOffAddresses.map(addr => addr.name || "Unknown Location");

    // Clear previous content in the container
    selectBooking.innerHTML = `
        <div class="addresses"></div>

        <div id="drivers-container"></div>
        <div id="vehicles-container"></div>

        <div class="expense-box">
            <div class="total">
                <h3>Expense Total:</h3>
                <span>R${price}</span>
            </div>
            <div class="details"></div>
        </div>

        <button id="saveDetails"><i class="ri-save-3-fill"></i> Save Details</button>
    `;

    const addressesContainer = selectBooking.querySelector(".addresses");
    const driversContainer = selectBooking.querySelector("#drivers-container");
    const vehiclesContainer = selectBooking.querySelector("#vehicles-container");

    // Helper function to create address list items
    const addAddressItem = (icon, title, address) => {
        addressesContainer.insertAdjacentHTML('beforeend', `
            <div class="address-box">
                <div class="address">
                    <span>${title}:</span>
                    <p>${address}</p>
                </div>
                <div class="icon"><i class="${icon}"></i></div>
            </div>
        `);
    };

    // Populate pick-up and drop-off addresses
    if (pickUpAddress.name) addAddressItem("ri-map-pin-2-fill", "Pick Up", pickUpAddress.name);
    dropOffAddressNames.forEach((name, index) => {
        const title = index === dropOffAddressNames.length - 1 ? "Drop Off" : `Stop ${index + 1}`;
        addAddressItem("ri-pin-distance-fill", title, name);
    });

    // Populate multiple drivers
    drivers.forEach(driver => {
        const {
            image: driverImg = "Images/gallery.png",
            name: nameSurname = "Driver's Name",
            number = "+27 00 000 0000",
            averageRating: rating = "0",
        } = driver;

        driversContainer.insertAdjacentHTML('beforeend', `
            <div class="driver-box">
                <div class="img"><img src="${driverImg}" alt="Driver Image"></div>
                <div class="details">
                    <h1 class="name">${nameSurname}</h1>
                    <h3 class="rating">${rating} <i class="ri-shield-star-fill"></i></h3>
                </div>
            </div>
        `);
    });

    // Populate multiple vehicles
    vehicles.forEach(vehicle => {
        const {
            brand = "Brand",
            model = "Model",
            seats = "0",
            fuelEfficiency = "0",
            fuelType = "0",
            index = 0,
            images = ["Images/land-rover.png"],
            colors = ["White"],
        } = vehicle;

        const image = images[0];
        const color = colors[0];

        vehiclesContainer.insertAdjacentHTML('beforeend', `
            <div class="vehicle-box">
                <div class="img"><img src="${image}" alt="Vehicle Image"></div>
                <div class="details">
                    <h1 class="name">${brand} ${model} ${index}</h1>
                    <h3 class="color"><b>Colour:</b> ${color}</h3>
                    <h3 class="seats"><b>Seats:</b> ${seats}</h3>
                    <h3 class="fuel"><b>Fuel Efficiency:</b> ${fuelEfficiency} Km/L</h3>
                    <h3 class="fuel"><b>Fuel Type:</b> ${fuelType}</h3>
                </div>
            </div>
        `);
    });

    selectBooking.querySelector("#saveDetails").style.display = "none";
    updateExpenseDetails(drivers, vehicles, myData, booking, valid);
}


// >>>      Helper Function    <<< 


function updateExpenseDetails(driver, vehicle, data, booking, valid) {
    const selectBooking = document.getElementById('selectBooking');
    if (!selectBooking) {
        console.error("Booking container not found.");
        return;
    }

    const totalElement = selectBooking.querySelector(".expense-box .total");
    const detailsElement = selectBooking.querySelector(".expense-box .details");

    if (!totalElement || !detailsElement) {
        console.error("Expense elements not found.");
        return;
    }

    detailsElement.innerHTML = ""; // Clear all existing items
    let totalCost = 0;
    const expenseItems = {};

    const loadPriceMap = () => {
        console.log("Loading price map...");
        Object.entries(booking.price || {}).forEach(([label, cost]) => {
            if (label === "total") {
                console.log("Skipping total from price map.");
                return; // Skip adding the total value to the expense items
            }
            console.log(`Adding expense item from price map: ${label}, Cost: ${cost}`);
            const isEditable = label !== "Fuel Cost:"; // Ensure fuel cost is not editable
            addExpenseItem(`price-${label}`, label, parseFloat(cost), isEditable);
        });
        updateTotalCost(); // Update the total display
    };

    const addExpenseItem = (id, label, cost, isEditable = false) => {
        console.log(`Adding expense item: ${label}, Cost: ${cost}`);
        expenseItems[id] = { label, cost, isEditable };

        const itemHTML = `
            <div class="text ${id === 'markup' ? 'markup-item' : ''}" data-id="${id}">
                <p class="item-label">${label}</p>
                <p class="item-price">R${cost.toFixed(2)}</p>
            </div>
        `;
        detailsElement.insertAdjacentHTML('beforeend', itemHTML);
    };

    const updateTotalCost = () => {
        totalCost = Object.values(expenseItems).reduce((sum, item) => sum + item.cost, 0);
        console.log("Updating total cost display...");
        totalElement.innerHTML = `
            <h3>Expense Details:</h3>
            <span>R${totalCost.toFixed(2)}</span>
        `;
    };

    if (booking.price && booking.price !== 0) {
        loadPriceMap();
    }
}









/* -----------------------------         Main (Book)         ------------------------------------ */









function displayCalendar(currentDate, vendor, myData) {
    const months = ["January", "February", "March", 
        "April", "May", "June", "July", "August", 
        "September", "October", "November", "December"
    ];

    generateWeek(currentDate, vendor, myData);

    document.getElementById("prevWeek").addEventListener("click", function () {
        currentDate.setDate(currentDate.getDate() - 7);
        generateWeek(currentDate, vendor, myData);
    });

    document.getElementById("nextWeek").addEventListener("click", function () {
        currentDate.setDate(currentDate.getDate() + 7);
        generateWeek(currentDate, vendor, myData);
    });

    function generateWeek(date, vendor, myData) {
        const weekDays = document.querySelectorAll("#book .week li");
        bookingDate = date;

        const clearDateElements = (li) => {
            ['h1', 'h3', 'h5', 'span'].forEach(tag => {
                const element = li.querySelector(tag);
                if (element) li.removeChild(element);
            });
        };

        const setDateElements = (li, day, month, year) => {
            li.innerHTML += `<h1>${day}</h1><h3>${month}</h3><h5>${year}</h5>`;
        };

        // Clear previous active state and add the span for non-active li
        weekDays.forEach((li, index) => {
            li.classList.remove("active");
            clearDateElements(li);

            // Calculate the date for each li element
            let weekDayDate = new Date(date);
            weekDayDate.setDate(date.getDate() + index - date.getDay());

            let day = weekDayDate.getDate();
            let month = weekDayDate.getMonth() + 1; // Month as a number (1-12)

            // Add span with date for non-active elements
            if (!li.classList.contains("active")) {
                li.innerHTML += `<span>${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}</span>`;
            }
        });

        let dayNum = date.getDay();
        let day = date.getDate();
        let month = months[date.getMonth()];
        let year = date.getFullYear();

        let active = weekDays[dayNum];
        active.classList.add("active");
        setDateElements(active, day, month, year);

        // Add click event listener to each li element
        weekDays.forEach((li, index) => {
            li.addEventListener("click", function() {
                // Clear previous active state
                weekDays.forEach(el => {
                    el.classList.remove("active");
                    clearDateElements(el);

                    // Add span for non-active elements
                    let weekDayDate = new Date(date);
                    weekDayDate.setDate(date.getDate() + index - dayNum);
                    let day = weekDayDate.getDate();
                    let month = weekDayDate.getMonth() + 1;
                    if (!el.classList.contains("active")) {
                        el.innerHTML += `<span>${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}</span>`;
                    }
                });

                // Set new active state
                li.classList.add("active");

                let tripDate = new Date(date);
                tripDate.setDate(date.getDate() + index - dayNum);

                bookingDate = tripDate;
                let selectedDay = tripDate.getDate();
                let selectedMonth = months[tripDate.getMonth()];
                let selectedYear = tripDate.getFullYear();

                setDateElements(li, selectedDay, selectedMonth, selectedYear);
            });
        });
    }
}

function initAutocomplete() {
    const searchAddress = document.getElementById("searchAddress");
    const pickUp = document.getElementById("pickUp");
    const dropOffElements = document.querySelectorAll(".dropOff");

    autoComplete = new google.maps.places.Autocomplete(searchAddress, {
        types: ['geocode'],
        componentRestrictions: { country: 'ZA' },
        fields: ['place_id', 'geometry', 'name', 'formatted_address', 'photos']
    });

    pickMeUp = new google.maps.places.Autocomplete(pickUp, {
        types: ['geocode'],
        componentRestrictions: { country: 'ZA' },
        fields: ['place_id', 'geometry', 'name', 'formatted_address', 'photos']
    });
    addPlaceChangedListener(pickMeUp, pickUp, 'pickUp');

    dropOffElements.forEach((dropOffElement, index) => {
        dropMeOff[index] = new google.maps.places.Autocomplete(dropOffElement, {
            types: ['geocode'],
            componentRestrictions: { country: 'ZA' },
            fields: ['place_id', 'geometry', 'name', 'formatted_address', 'photos']
        });
        addPlaceChangedListener(dropMeOff[index], dropOffElement, `dropOffAddresses[${index}]`);
    });

    addPlaceChangedListener(autoComplete, searchAddress, 'search');
}

function addPlaceChangedListener(autocompleteInstance, inputElement, key) {
    autocompleteInstance.addListener('place_changed', async () => {
        const place = autocompleteInstance.getPlace();

        if (!place.geometry) {
            console.log("Place not found");
            return;
        }

        inputElement.value = place.formatted_address;

        const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
        };

        const image = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${location.lat},${location.lng}&key=AIzaSyCllsRBlMRhgc-FWqVDhEj3SsujT-Restw`;

        // Save the selected address details
        if (key === 'search') {
            selectedAddress.dropOffAddresses[0] = {
                placeId: place.place_id,
                name: place.name,
                address: place.formatted_address,
                geometry: location,
                image
            };

            deactivateAll();
            activateSection(1);
            document.getElementById("dropOff").value = place.formatted_address;
            window.history.pushState({ page: "book", action: "default" }, '', "");
        } else if (key === 'pickUp') {
            selectedAddress.pickUpAddress = {
                placeId: place.place_id,
                name: place.name,
                address: place.formatted_address,
                geometry: location,
                image
            };

            deactivateAll();
            activateSection(1);
            document.getElementById("pickUp").value = place.formatted_address;
            window.history.pushState({ page: "book", action: "default" }, '', "");
        } else if (key.startsWith('dropOffAddresses')) {
            const index = parseInt(key.match(/\d+/)[0]);
            selectedAddress.dropOffAddresses[index] = {
                placeId: place.place_id,
                name: place.name,
                address: place.formatted_address,
                geometry: location,
                image
            };
        } else if (key === "addHome") {
            const userRef = doc(db, "users", myData.id);
            await updateDoc(userRef, {
                homeAddress: {
                    placeId: place.place_id,
                    name: place.name,
                    address: place.formatted_address,
                    geometry: location,
                    image
                }
            });

            history.back();
        } else if (key === "addWork") {
            const userRef = doc(db, "users", myData.id);
            await updateDoc(userRef, {
                workAddress: {
                    placeId: place.place_id,
                    name: place.name,
                    address: place.formatted_address,
                    geometry: location,
                    image
                }
            });

            history.back();
        } else {
            selectedAddress[key] = {
                placeId: place.place_id,
                name: place.name,
                address: place.formatted_address,
                geometry: location,
                image
            };
        }

        console.log("selectedAddress:", selectedAddress);
    });
}

function addStop(address = "") {
    const selectBox = document.querySelector(".select-box");
    const newAddressDiv = document.createElement("div");
    newAddressDiv.style.gridTemplateColumns = "50px 1fr 25px";
    newAddressDiv.classList.add("address", "line");

    const newIcon = document.createElement("i");
    newIcon.classList.add("ri-pin-distance-fill");

    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.classList.add("dropOff");
    newInput.placeholder = "Drop Off Address...";

    if (address && address !== "") {
        console.log(address)
        newInput.value = address;
    }

    newAddressDiv.appendChild(newIcon);
    newAddressDiv.appendChild(newInput);

    // Add trash icon if there is more than 1 dropOff
    const dropOffCount = document.querySelectorAll(".dropOff").length;
    if (dropOffCount > 0) {
        const trashIcon = document.createElement("i");
        trashIcon.classList.add("ri-delete-bin-line");
        trashIcon.style.cursor = "pointer";
        trashIcon.addEventListener("click", () => {
            const currentIndex = Array.from(selectBox.children).indexOf(newAddressDiv);

            newAddressDiv.remove();

            // Remove the autocomplete instance and address
            if (currentIndex > 0 && currentIndex <= dropMeOff.length) {
                dropMeOff.splice(currentIndex - 1, 1); // Adjust index for dropMeOff
                selectedAddress.dropOffAddresses.splice(currentIndex - 1, 1); // Adjust index for dropOffAddresses
            }
        });
        newAddressDiv.appendChild(trashIcon);
    }

    selectBox.insertBefore(newAddressDiv, selectBox.lastElementChild);

    // Initialize the new autocomplete for the added input
    const newAutocomplete = new google.maps.places.Autocomplete(newInput, {
        types: ['geocode'],
        componentRestrictions: { country: 'ZA' },
        fields: ['place_id', 'geometry', 'name', 'formatted_address', 'photos']
    });

    dropMeOff.push(newAutocomplete);

    // Add place change listener to the new autocomplete instance
    addPlaceChangedListener(newAutocomplete, newInput, `dropOffAddresses[${dropMeOff.length - 1}]`);
}

async function getDirections(origins, destination) {
    const service = new google.maps.DirectionsService();

    return new Promise((resolve, reject) => {
        console.log(`Getting directions from ${origins} to ${destination}`);
        service.route({
            origin: origins,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            drivingOptions: {
                departureTime: new Date(), // Set a specific departure time for accurate traffic conditions
                trafficModel: google.maps.TrafficModel.BEST_GUESS // Use best guess based on traffic
            }
        }, (response, status) => {
            if (status === "OK") {
                console.log('Directions API response:', response);
                const route = response.routes[0].legs[0];
                resolve({
                    distance: route.distance.value, // Distance in meters
                    duration: route.duration_in_traffic ? route.duration_in_traffic.value : route.duration.value // Duration in seconds
                });
            } else {
                console.error(`Error with Directions Service: ${status}`);
                reject(`Error with Directions Service: ${status}`);
            }
        });
    });
}

async function bookNow(myData) {
    const date = bookingDate.toISOString().split('T')[0];
    const bookingRef = doc(db, "users", myData.id, "bookings", date);

    // Validate and prepare locations
    const prepareLocation = (geometry) => {
        if (geometry && typeof geometry.lat === 'number' && typeof geometry.lng === 'number') {
            return new google.maps.LatLng(geometry.lat, geometry.lng);
        } else {
            console.error('Invalid or missing location geometry:', geometry);
            return null;
        }
    };

    const pickUpLocation = prepareLocation(selectedAddress.pickUpAddress?.geometry);
    if (!pickUpLocation) return;

    const dropOffLocations = selectedAddress.dropOffAddresses
        .map(({ geometry }) => prepareLocation(geometry))
        .filter(Boolean);

    if (dropOffLocations.length === 0) {
        console.error('No valid drop-off locations.');
        return;
    }

    let totalDistance = 0;
    let totalETA = 0;

    // Loop through each segment of the trip to accumulate distance and ETA
    for (let i = 0; i < dropOffLocations.length; i++) {
        const origin = i === 0 ? pickUpLocation : dropOffLocations[i - 1];
        const destination = dropOffLocations[i];

        // Skip if the origin and destination are the same to avoid zero distance/duration issues
        if (origin.equals(destination)) {
            console.log(`Skipping segment ${i + 1} as origin and destination are the same.`);
            continue;
        }

        if (!origin || !destination) {
            console.error(`Invalid segment with origin: ${origin}, destination: ${destination}`);
            continue; // Skip this segment if origin or destination is invalid
        }

        console.log(`Calculating segment from ${origin} to ${destination}`);

        try {
            const result = await getDirections(origin, destination);

            if (result) {
                console.log(`Segment ${i + 1} - Distance: ${result.distance} meters, Duration: ${result.duration} seconds`);
                totalDistance += result.distance;
                totalETA += result.duration;
            } else {
                console.error('No result for this segment.');
            }
        } catch (error) {
            console.error(`Error in segment ${i + 1}:`, error);
        }
    }

    console.log(`Total Distance: ${totalDistance} meters, Total ETA: ${totalETA} seconds`);

    // Prepare drop-off details
    const dropOffDetails = selectedAddress.dropOffAddresses.map((address, index) => ({
        address: address.address,
        geometry: {
            location: address.geometry || null,
            viewport: address.geometry?.viewport?.toJSON() || null
        },
        image: address.image,
        name: address.name,
        placeId: address.placeId,
        distance: `${(totalDistance / 1000).toFixed(2)} km`,
        eta: `${Math.ceil(totalETA / 60)} mins`
    }));

    const newTrip = {
        pickUpTime: "00:00",
        drivers: {},
        vehicles: {},
        pickUpAddress: {
            address: selectedAddress.pickUpAddress.address,
            geometry: {
                location: selectedAddress.pickUpAddress.geometry || null,
                viewport: selectedAddress.pickUpAddress.geometry?.viewport?.toJSON() || null
            },
            image: selectedAddress.pickUpAddress.image,
            name: selectedAddress.pickUpAddress.name,
            placeId: selectedAddress.pickUpAddress.placeId
        },
        dropOffAddresses: dropOffDetails,
        seats: 6,
        price: {
            total: 0
        },
        totalDistance: `${(totalDistance / 1000).toFixed(2)} km`, // Total distance in kilometers
        totalETA: `${Math.ceil(totalETA / 60)} mins`, // Total ETA in minutes
        status: "Pending..." // Add status to each trip
    };

    // Check if a booking already exists for the date
    const bookingDoc = await getDoc(bookingRef);

    let bookingDetails;
    if (bookingDoc.exists()) {
        // Append the new trip to the existing trips array
        bookingDetails = bookingDoc.data();
        bookingDetails.trips.push(newTrip);
        bookingDetails.updatedAt = new Date();
    } else {
        // Create a new booking document
        bookingDetails = {
            startDate: date,
            createdAt: new Date(),
            updatedAt: new Date(),
            price: 0,
            trips: [newTrip]
        };
    }

    console.log("Final bookingDetails:", bookingDetails);
    await setDoc(bookingRef, bookingDetails);
}









/* -----------------------------         Main (Map)         ------------------------------------ */









function dragMapBody() {
    const body = document.querySelector('#map .body');
    const headerImg = document.querySelector('#map .header .img img');
    const moreInfo = document.querySelector('#map .body .more-info');
    let startY = 0;
    let startBottom = 0;
    let isDragging = false;
    const initialBottom = parseInt(window.getComputedStyle(body).bottom, 10);
    headerImg.style.filter = `grayscale(60%)`;

    // Set initial cursor to 'grab'
    body.style.cursor = 'grab';

    function getMaxDrag() {
        return window.innerWidth < 500 ? 300 : 320;
    }

    function onMouseDown(event) {
        if (moreInfo.contains(event.target)) return;
        startY = event.clientY;
        startBottom = parseInt(window.getComputedStyle(body).bottom, 10);
        isDragging = true;
        body.style.cursor = 'grabbing'; // Change cursor to grabbing
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    function onTouchStart(event) {
        if (moreInfo.contains(event.target)) return;
        startY = event.touches[0].clientY;
        startBottom = parseInt(window.getComputedStyle(body).bottom, 10);
        isDragging = true;
        body.style.cursor = 'grabbing'; // Change cursor to grabbing
        document.addEventListener('touchmove', onTouchMove);
        document.addEventListener('touchend', onTouchEnd);
    }

    function onMouseMove(event) {
        if (!isDragging) return;
        const newBottom = startBottom - (event.clientY - startY);
        const maxDrag = getMaxDrag();
        // Allow dragging downwards but restrict dragging upwards beyond the initial position
        if (newBottom >= initialBottom - maxDrag && newBottom <= initialBottom) {
            body.style.bottom = `${newBottom}px`;
            updateGreyscale(initialBottom - newBottom, maxDrag);
        }
    }

    function onTouchMove(event) {
        if (!isDragging) return;
        const newBottom = startBottom - (event.touches[0].clientY - startY);
        const maxDrag = getMaxDrag();
        // Allow dragging downwards but restrict dragging upwards beyond the initial position
        if (newBottom >= initialBottom - maxDrag && newBottom <= initialBottom) {
            body.style.bottom = `${newBottom}px`;
            updateGreyscale(initialBottom - newBottom, maxDrag);
        }
    }

    function updateGreyscale(dragDistance, maxDrag) {
        const greyscaleValue = 60 - (dragDistance / maxDrag) * 60;
        headerImg.style.filter = `grayscale(${greyscaleValue}%)`;
    }

    function onMouseUp() {
        isDragging = false;
        body.style.cursor = 'grab'; // Change cursor back to grab
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    function onTouchEnd() {
        isDragging = false;
        body.style.cursor = 'grab'; // Change cursor back to grab
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
            averageRating = "0"
        } = {},
        price = "",
        pickUpAddress = "",
        dropOffAddresses = [],
        totalETA = "0",
        totalDistance = "0"
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
                <p class="rating">${averageRating} <i class="ri-shield-star-fill"></i></p>
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
    createList("ri-map-pin-2-line", "Picked Up At:", pickUpAddress.name);

    dropOffAddresses.forEach((address, index) => {
        const isLast = index === dropOffAddresses.length - 1;
        const title = isLast ? "Dropped Off At:" : `Stop ${index + 1}:`;
        createList("ri-pin-distance-line", title, address.name);
    });

    createList("ri-timer-line", "Estimated Time Of Arrival:", totalETA);
}









/* -----------------------------         Main (Chat)         ------------------------------------ */









const header = document.querySelector("#chat .header");
const seeMoreInfo = document.querySelector("#chat .body #seeMoreInfo");
const chatBox = document.querySelector("#chat .body #chatBox");
const footer = document.querySelector("#chat .footer");
const chatIcon = document.getElementById("newMsg");

//  >>>   Chat history scrolled to the bottom   <<<
document.addEventListener("DOMContentLoaded", function() {
    chatBox.scrollTop = chatBox.scrollHeight;
});

function displayChat(currentDate, myData) {
    const { currentBooking: trip, id: userId } = myData;
    const header = document.querySelector("#chat .header");
    const chatBox = document.querySelector("#chat .body #chatBox");
    const footer = document.querySelector("#chat .footer");
    const chatIcon = document.getElementById("newMsg");
    let hasUnreadMessage = false;

    // Utility function to set header content
    const setHeaderContent = (image, name, status) => {
        header.innerHTML = `
            <div class="img">
                <img src="${image}" alt="Profile Picture" style="object-fit: cover">
            </div>
            <div class="info">
                <div class="name">${name}</div>
                <div class="status">${status}</div>
            </div>
        `;
    };

    // Function to handle message sending
    const sendMessage = () => {
        const messageInput = footer.querySelector("textarea");
        const messageText = messageInput.value.trim();
        if (messageText) {
            addDoc(chatRef, { text: messageText, senderId: userId, createdAt: new Date() })
                .then(() => (messageInput.value = '')) // Clear input
                .catch(error => console.error("Error sending message: ", error));
        }
    };

    // Add event listener for header click
    header.addEventListener('click', () => {
        header.classList.remove("active");
        activateHTML(chatBox, seeMoreInfo);
        window.history.pushState({ page: "chat", action: "seeMore" }, '', "");
    });

    // Add event listeners for sending messages
    footer.querySelector("button").addEventListener('click', sendMessage);
    footer.querySelector("textarea").addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    // If no trip is active, show default content
    if (!trip) {
        setHeaderContent('Images/gallery.png', 'Name and Surname', '<i class="ri-signal-tower-fill"></i>');
        chatBox.innerHTML = `<div class="box me"><p>To communicate with your Driver you need to have an approved booking!</p></div>`;
        footer.querySelector("textarea").disabled = true;
        return;
    }

    const { startDate, drivers, dropOffAddresses } = trip;
    const chatRef = collection(db, "chats", `${startDate} > ${userId}`, "messages");

    // Set header content based on number of drivers
    if (Object.keys(drivers).length > 1) {
        const lastDropOff = dropOffAddresses[dropOffAddresses.length - 1];
        setHeaderContent(lastDropOff.image || 'Images/gallery.png', lastDropOff.name, 'Click To View Drivers');
    } else {
        const driver = Object.values(drivers)[0];
        setHeaderContent(driver.image || 'Images/gallery.png', `${driver.name} ${driver.surname}`, '<i class="ri-signal-tower-fill"></i> Online');
    }

    // Create driver list
    drivers.forEach(driver => {
        const createdLi = document.createElement("li");
        createdLi.innerHTML = `
            <div class="img">
                <img src="${driver.image || 'Images/gallery.png'}" alt="Driver Profile Picture">
            </div>
            <div class="info">
                <div class="name">${driver.name} ${driver.surname}</div>
                <div class="status"><i class="ri-signal-tower-fill"></i> Online</div>
            </div>
        `;
        seeMoreInfo.appendChild(createdLi);
    });

    // Set up real-time listener for messages
    const messagesQuery = query(chatRef, orderBy('createdAt', 'asc'));
    onSnapshot(messagesQuery, snapshot => {
        chatBox.innerHTML = '';
        let lastDate = null;

        snapshot.forEach(doc => {
            const { text, senderId, createdAt } = doc.data();
            const messageDate = new Date(createdAt.seconds * 1000).toDateString();

            // Add date separator if necessary
            if (lastDate !== messageDate) {
                const dateElement = document.createElement('div');
                dateElement.classList.add('message-date');
                dateElement.textContent = messageDate;
                chatBox.appendChild(dateElement);
                lastDate = messageDate;
            }

            // Create message element
            const messageElement = document.createElement('div');
            messageElement.classList.add("box", senderId === userId ? "me" : "you");

            // Add driver info if the message is from a driver
            if (senderId !== userId) {
                const driver = drivers.find(d => d.id === senderId);
                if (driver) {
                    const driverInfo = document.createElement('div');
                    driverInfo.classList.add('driver-info');
                    driverInfo.textContent = `${driver.name} ${driver.surname}`;
                    messageElement.appendChild(driverInfo);
                }
                hasUnreadMessage = true;
            }

            // Add message text and timestamp
            messageElement.innerHTML += `<p>${text}</p><div class="time">${formatCreatedAt(createdAt)}</div>`;
            chatBox.appendChild(messageElement);
        });

        // Update chat icon based on unread messages
        chatIcon.classList.toggle('active', hasUnreadMessage);
    });
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
        <h5>${myData.gender}</h5>
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
const deactivateAllSections = () => {
    menuItem.classList.remove("active");
    navItems.forEach(item => item.classList.remove("active"));
};

// Function to activate a specific navigation item and section by index
const activateSection = index => {
    navItems[index]?.classList.add("active");
    activateHTML(document.querySelector("section.active"), sections[index])
};