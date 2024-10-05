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
    getFirestore, collection, getDocs, limit, serverTimestamp, runTransaction,
    doc, getDoc, onSnapshot, deleteDoc, addDoc, collectionGroup, orderBy, writeBatch, 
    query, where, updateDoc, setDoc, initializeFirestore, persistentLocalCache, documentId
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
const storage = getStorage(app);
const messaging = getMessaging(app);
const functions = getFunctions(app, 'us-central1');

document.querySelectorAll('.date').forEach((dateInput) => {
    dateInput.addEventListener('click', function() {
        this.showPicker(); // This is a method in newer browsers to show the date picker
    });
});

document.querySelectorAll('.time').forEach((timeInput) => {
    timeInput.addEventListener('click', function() {
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









let allVehicles;
let prices;
let activeDrivers = [];
let activeVehicles = [];
let activeUsers = [];

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


            const currentDate = new Date();

            menuNavigation();
            mainNavigation();

            const tasks = [
                { func: () => getVendorData(user), name: "getVendorData" },
                { func: () => getCustomersData(user), name: "getCustomersData" },
                { func: () => getVehicles(), name: "getVehicles" },
                { func: () => getPrices(), name: "getPrices" },
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

                updateProgressBar(50);


                // ====================>   Get data   


                const myData = results[0];
                console.log("My vehicles", myData.vehicles)
                const customers = results[1];
                console.log("customers", customers)
                allVehicles = results[2];
                const allPrices = results[3];
                console.log("allPrices", allPrices)


                // ====================>   Initial Functions   


                try {
                    processBookingsAndDisplay(myData, customers, currentDate);
                } catch (error) {
                    console.error(`Error in processBookingsAndDisplay:`, error);
                }


                //  >>> Main (Home)


                try {
                    displayCustomerBookings(currentDate, customers, myData);
                } catch (error) {
                    console.error(`Error in displayBookings:`, error);
                }


                //  >>> Main (Drivers)





                //  >>> Main (Customers)




                
                //  >>> Main (Vehicles)





                //  >>> Main (Menu)


                try {
                    displayProfileDetails(myData);
                } catch (error) {
                    console.error(`Error in displayProfileDetails: ${error}`);
                }


                // ====================>   Event Listeners   


                //  >>> Main (Home)

                document.getElementById("searchBooking").addEventListener("input", handleBookingSearch);
                
                function handleBookingSearch() {
                    const searchTerm = document.getElementById("searchBooking").value.toLowerCase();
                    const activePage = document.querySelector("#home .body .page.active");
                    const idName = activePage ? activePage.id : null;
                    const page = document.querySelector("#home .body #seeMore");

                    if (idName === "tripSummary") {
                        window.history.pushState({ page: "vehicles", action: "seeMore" }, '', "");
                        activateHTML(activePage, page);
                    }
                    
                    filterBookings(currentDate, customers, page, searchTerm);
                }

                document.querySelector("#moreTrips").addEventListener("click", () => {
                    try {
                        activateHTML(tripSummary, seeMore);
                        window.history.pushState({ page: "home", action: "moreTrips" }, '', "");
                        console.log(customers)
                        displayMoreBookings(myData, customers, seeMore, "Upcoming");
                    } catch (error) {
                        console.error(`Error in displayMoreBookings:`, error);
                    }
                })

                document.querySelector("#moreHistory").addEventListener("click", () => {
                    try {
                        activateHTML(tripSummary, seeMore);
                        window.history.pushState({ page: "home", action: "moreHistory" }, '', "");

                        displayMoreBookings(myData, customers, seeMore, "History");
                    } catch (error) {
                        console.error(`Error in displayMoreBookings:`, error);
                    }
                })

                //  >>> Main (Drivers)

                document.getElementById("searchDriver").addEventListener("input", handleDriverSearch);
                document.getElementById("searchDriverType").addEventListener("change", handleDriverSearch);
                document.getElementById("searchDriverRating").addEventListener("change", handleDriverSearch);

                function handleDriverSearch() {
                    const searchTerm = document.getElementById("searchDriver").value.toLowerCase();
                    const selectedType = document.getElementById("searchDriverType").value;
                    const selectedSeats = document.getElementById("searchDriverRating").value;
                    const activePage = document.querySelector("#drivers .body .page.active");
                    const idName = activePage ? activePage.id : null;

                    if (idName === "seeMoreDrivers") {
                        filterDrivers(myData, myData.drivers, activePage.querySelector(".content"), searchTerm, selectedType, selectedSeats);
                    } else if (idName === "viewDrivers") {
                        filterDrivers(myData, allDrivers, activePage, searchTerm, selectedType, selectedSeats);
                    }
                }

                document.querySelector("#drivers #moreUsed").addEventListener("click", () => {
                    try {
                        activateHTML(driverSummary, moreDrivers);
                        window.history.pushState({ page: "drivers", action: "seeMore" }, '', "");

                        document.querySelector("#drivers .header").classList.add("active");

                        const title = `
                            <h1>En Route:</h1>
                        `;

                        displayMoreDrivers(currentDate, myData, activeDrivers, title, "No drivers on the road...");
                    } catch (error) {
                        console.error(`Error in displayMoreDrivers:`, error);
                    }
                })

                document.querySelector("#moreDrivers").addEventListener("click", () => {
                    try {
                        activateHTML(driverSummary, moreDrivers);
                        window.history.pushState({ page: "drivers", action: "seeMore" }, '', "");

                        document.querySelector("#drivers .header").classList.add("active");

                        const title = `
                            <h1>My Team:</h1>
                            <i class="ri-add-line"></i>
                        `;

                        displayMoreDrivers(currentDate, myData, myData.drivers, title, "Add your first driver...");
                    } catch (error) {
                        console.error(`Error in displayMoreDrivers:`, error);
                    }
                })

                /*document.getElementById('addDriver').addEventListener('click', async (e) => {
                    e.stopPropagation();
                    fadeInLoader();
                    updateProgressBar(0);
                    addDriver(myData);
                });*/

                //  >>> Main (Customers)

                document.getElementById("searchCustomer").addEventListener("input", handleCustomerSearch);
                document.getElementById("searchCustomerType").addEventListener("change", handleCustomerSearch);
                document.getElementById("searchCustomerCount").addEventListener("change", handleCustomerSearch);

                function handleCustomerSearch() {
                    const searchTerm = document.getElementById("searchCustomer").value.toLowerCase();
                    const selectedType = document.getElementById("searchCustomerType").value;
                    const selectedSeats = document.getElementById("searchCustomerCount").value;
                    const activePage = document.querySelector("#customers .body .page.active");
                    const idName = activePage ? activePage.id : null;

                    if (idName === "seeMoreCustomers") {
                        filterCustomers(myData, customers, activePage.querySelector(".content"), searchTerm, selectedType, selectedSeats);
                    } else if (idName === "viewCustomers") {
                        filterCustomers(myData, customers, activePage, searchTerm, selectedType, selectedSeats);
                    }
                }

                document.querySelector("#customers #moreUsed").addEventListener("click", () => {
                    try {
                        activateHTML(customerSummary, moreCustomers);
                        window.history.pushState({ page: "customers", action: "seeMore" }, '', "");

                        document.querySelector("#customers .header").classList.add("active");

                        const title = `
                            <h1>En Route:</h1>
                        `;

                        displayMoreCustomers(currentDate, myData, activeUsers, title, "No customers on the road...");
                    } catch (error) {
                        console.error(`Error in displayMoreCustomers:`, error);
                    }
                })

                document.querySelector("#moreCustomers").addEventListener("click", () => {
                    try {
                        activateHTML(customerSummary, moreCustomers);
                        window.history.pushState({ page: "customers", action: "seeMore" }, '', "");

                        document.querySelector("#customers .header").classList.add("active");

                        const title = `
                            <h1>Client List:</h1>
                            <i class="ri-add-line"></i>
                        `;

                        displayMoreCustomers(currentDate, myData, customers, title, "Add your first customer...");
                    } catch (error) {
                        console.error(`Error in displayMoreCustomers:`, error);
                    }
                })


                /*document.getElementById('addCustomer').addEventListener('click', async (e) => {
                    e.stopPropagation();
                    fadeInLoader();
                    updateProgressBar(0);
                    addCustomer(myData);
                });*/

                //  >>> Main (Vehicles)

                document.getElementById("searchVehicle").addEventListener("input", handleVehicleSearch);
                document.getElementById("searchVehicleType").addEventListener("change", handleVehicleSearch);
                document.getElementById("searchVehicleSeats").addEventListener("change", handleVehicleSearch);
                
                function handleVehicleSearch() {
                    const searchTerm = document.getElementById("searchVehicle").value.toLowerCase();
                    const selectedType = document.getElementById("searchVehicleType").value;
                    const selectedSeats = document.getElementById("searchVehicleSeats").value;
                    const activePage = document.querySelector("#vehicles .body .page.active");
                    const idName = activePage ? activePage.id : null;
                
                    if (idName === "seeMoreVehicles") {
                        filterVehicles(myData, myData.vehicles, activePage.querySelector(".content"), searchTerm, selectedType, selectedSeats);
                    } else if (idName === "viewVehicles") {
                        filterVehicles(myData, allVehicles, activePage, searchTerm, selectedType, selectedSeats);
                    }
                }

                document.querySelector("#vehicles #moreUsed").addEventListener("click", () => {
                    try {
                        activateHTML(vehicleSummary, moreVehicles);
                        window.history.pushState({ page: "vehicles", action: "seeMore" }, '', "");

                        document.querySelector("#vehicles .header").classList.add("active");

                        const title = `
                            <h1>En Route:</h1>
                        `;

                        displayMoreVehicles(currentDate, myData, activeVehicles, title, "No vehicles on the road...");
                    } catch (error) {
                        console.error(`Error in displayMoreVehicles:`, error);
                    }
                })

                document.querySelector("#moreVehicles").addEventListener("click", () => {
                    try {
                        activateHTML(vehicleSummary, moreVehicles);
                        window.history.pushState({ page: "vehicles", action: "seeMore" }, '', "");

                        document.querySelector("#vehicles .header").classList.add("active");

                        const title = `
                            <h1>My Fleet:</h1>
                            <i class="ri-add-line"></i>
                        `;

                        displayMoreVehicles(currentDate, myData, myData.vehicles, title, "Add your first vehicle...");
                    } catch (error) {
                        console.error(`Error in displayMoreVehicles:`, error);
                    }
                })

                //  >>> Main (Menu)



                //  >>> History Popstate

                window.addEventListener("popstate", event => {
                    const state = event.state;
                    const { page, action } = state;
                    console.log('Page:', page);
                    console.log('Action:', action);

                    // Deactivate all navigation items and sections before activating the new one
                    deactivateAllSections();
                    document.querySelector(".popUp-box").classList.remove("active");

                    switch (page) {
                        case "home":
                            console.log("Home Page");
                            activateSection(0);

                            document.querySelector("#home .header").classList.add("active");
                            const activeHomePage = document.querySelector("#home .page.active");

                            const tripSummary = document.getElementById("tripSummary");
                            const seeMore = document.getElementById("seeMore");
                            const selectBooking = document.getElementById("selectBooking");
                            const viewDrivers = document.getElementById("viewDrivers");
                            const viewVehicleList = document.querySelector("#home #viewVehicles");
                
                            switch (action) {
                                case "default":
                                    activateHTML(activeHomePage, tripSummary);
                                    break;
                                case "seeMore":
                                    activateHTML(activeHomePage, seeMore);
                                    break;
                                case "selectBooking":
                                    document.querySelector("#home .header").classList.remove("active");
                                    activateHTML(activeHomePage, selectBooking);
                                    break;
                                case "viewDrivers":
                                    activateHTML(activeHomePage, viewDrivers);
                                    break;
                                case "viewVehicles":
                                    activateHTML(activeHomePage, viewVehicleList);
                                    break;
                                default:
                                    console.log("Home Page is default");
                                    break;
                            }
                            break;
                        case "drivers":
                            console.log("Drivers page");
                            activateSection(1);
                            
                            document.querySelector("#drivers .header").classList.add("active");
                            const activeDriverPage = document.querySelector("#drivers .page.active");
                            document.querySelector("#drivers .header").classList.remove("active");
                            document.querySelector(".popUp-box").classList.remove("active");
                            
                            const viewMyDrivers = document.querySelector("#drivers #viewDrivers");
                            const createDriver = document.querySelector("#drivers #createDriver");
                            
                            switch (action) {
                                case "default":
                                    activateHTML(activeDriverPage, driverSummary);
                                    break;
                                case "seeMore":
                                    document.querySelector("#drivers .header").classList.add("active");
                                    activateHTML(activeDriverPage, moreDrivers);
                                    break;
                                case "selectDriver":
                                    activateHTML(activeDriverPage, selectDriver);
                                    break;
                                case "viewDrivers":
                                    document.querySelector("#drivers .header").classList.add("active");
                                    displayAllDrivers(myData, document.querySelector("#seeMoreDrivers"));
                                    activateHTML(activeDriverPage, viewMyDrivers);
                                    break;
                                case "addDriver":
                                    document.querySelector("#drivers .header").classList.remove("active");
                                    activateHTML(activeDriverPage, createDriver);
                                    break;
                                default:
                                    console.log("Home Page is default");
                                    break;
                            }
                            
                            break;
                        case "customers":
                            console.log("Customers Page");
                            activateSection(2);

                            document.querySelector("#drivers .header").classList.add("active");
                            const activeCustomerPage = document.querySelector("#customers .page.active");
                            document.querySelector("#customers .header").classList.remove("active");
                            document.querySelector(".popUp-box").classList.remove("active");

                            const viewCustomers = document.querySelector("#customers #viewCustomers");

                            switch (action) {
                                case "default":
                                    activateHTML(activeCustomerPage, customerSummary);
                                    break;
                                case "seeMore":
                                    document.querySelector("#customers .header").classList.add("active");
                                    activateHTML(activeCustomerPage, moreCustomers);
                                    break;
                                case "selectCustomer":
                                    activateHTML(activeCustomerPage, selectCustomer);
                                    break;
                                case "viewCustomers":
                                    document.querySelector("#customers .header").classList.add("active");
                                    displayAllCustomers(myData, document.querySelector("#seeMoreCustomers"));
                                    activateHTML(activeCustomerPage, viewCustomers);
                                    break;
                                case "addDriver":
                                    document.querySelector("#drivers .header").classList.remove("active");
                                    activateHTML(activeDriverPage, createDriver);
                                    break;
                                default:
                                    console.log("Home Page is default");
                                    break;
                            }

                            break;
                        case "vehicles":
                            console.log("Vehicles Page");
                            activateSection(3);

                            const activeVehiclePage = document.querySelector("#vehicles .page.active");
                            document.querySelector("#vehicles .header").classList.remove("active");
                            document.querySelector(".popUp-box").classList.remove("active");

                            const viewVehicles = document.querySelector("#vehicles #viewVehicles");

                            switch (action) {
                                case "default":
                                    activateHTML(activeVehiclePage, vehicleSummary);
                                    break;
                                case "seeMore":
                                    document.querySelector("#vehicles .header").classList.add("active");
                                    activateHTML(activeVehiclePage, moreVehicles);
                                    break;
                                case "selectVehicle":
                                    activateHTML(activeVehiclePage, selectVehicle);
                                    break;
                                case "viewVehicles":
                                    document.querySelector("#vehicles .header").classList.add("active");
                                    displayAllVehicles(myData, document.querySelector("#seeMoreVehicles"))
                                    activateHTML(activeVehiclePage, viewVehicles);
                                    break;
                                default:
                                    console.log("Home Page is default");
                                    break;
                            }

                            break;
                        case "menu":
                            console.log("Menu Page");
                            menuItem.classList.add("active");
                            activateSection(4);

                        
                            break;
                        default:
                            console.log("Home Page is default");
                            window.history.replaceState({ page: "home", action: "default" }, '', window.location.pathname);
                            activateSection(0);

                            break;
                    }
                });

                window.history.replaceState({ page: "home", action: "default" }, '', window.location.pathname);

                
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
    handleSignUpForm();
    mainJS();
});


//  >>>     live listener Functions      <<<


async function monitorBookings(entities, entityType, subEntityType) {
    const activeSet = new Set();
    const currentTime = new Date();

    for (const entity of entities) {
        if (!entity?.id || (subEntityType === 'vehicles' && (!entity.brand || !entity.model))) {
            console.error(`Entity is missing 'id', 'brand', or 'model':`, entity);
            continue; // Skip this entity
        }

        const bookingsCollectionPath = subEntityType === 'vehicles'
            ? `${entityType}/vehicles/${entity.brand}/${entity.model}/${entity.id}/bookings`
            : `${entityType}/${entity.id}${subEntityType ? `/${subEntityType}` : ''}/bookings`;

        const bookingsCollectionRef = collection(db, bookingsCollectionPath);
        const bookingsQuery = query(bookingsCollectionRef, where(documentId(), ">", currentTime.toISOString().split('T')[0]));

        try {
            const bookingSnapshot = await getDocs(bookingsQuery); // Use getDocs for a one-time query, or keep onSnapshot if needed
            bookingSnapshot.forEach((bookingDoc) => {
                const startDate = bookingDoc.id;
                const { trips } = bookingDoc.data() || {};

                trips?.forEach(trip => {
                    const { pickUpTime, totalETA } = trip;
                    const jobStartTime = getJobStartTime(startDate, pickUpTime);
                    const jobEndTime = getJobEndTime(startDate, pickUpTime, totalETA);

                    if (currentTime.toDateString() === jobStartTime.toDateString()) {
                        if (currentTime >= jobStartTime && currentTime <= jobEndTime) {
                            activeSet.add(entity);
                        }
                    }
                });
            });
        } catch (error) {
            console.error(`Error monitoring bookings for ${entity.id}: ${error}`);
            throw error; // Rethrow error to be handled by the caller
        }
    }

    return [...activeSet]; // Return the active entities as an array
}

async function processBookingsAndDisplay(myData, customers, currentDate) {
    try {
        const activeDrivers = await monitorBookings(myData.drivers, `vendors/${myData.id}`, 'drivers');
        displayDrivers(currentDate, myData.drivers, myData);
        updateProgressBar(65);

        const activeUsers = await monitorBookings(customers, 'users', undefined);
        displayCustomers(currentDate, customers, myData);
        updateProgressBar(95);

        const activeVehicles = await monitorBookings(myData.vehicles, `vendors/${myData.id}`, 'vehicles');
        displayVehicles(currentDate, myData.vehicles, myData);

        console.log("activeDrivers:", activeDrivers);
        console.log("activeUsers:", activeUsers);
        console.log("activeVehicles:", activeVehicles);

        fadeOutLoader();
    } catch (error) {
        console.error(`Error in processing bookings or displaying data:`, error);
    }
}

function getJobStartTime(startDate, pickUpTime) {
    const pickUpDateTime = new Date(startDate);
    const [pickUpHour, pickUpMinute] = pickUpTime?.split(':').map(Number) || [0, 0];
    pickUpDateTime.setHours(pickUpHour, pickUpMinute);

    return pickUpDateTime;
}

function getJobEndTime(startDate, pickUpTime, etaString) {
    const pickUpDateTime = getJobStartTime(startDate, pickUpTime);
    const etaInMinutes = parseInt(etaString?.split(' ')[0], 10) || 0;
    return new Date(pickUpDateTime.getTime() + etaInMinutes * 60000);
}


//  >>>     Reusable Functions      <<<


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

function popUp(text, buttons) {

}

function updateImagePreview(event, img, ) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

async function uploadImageFromSrc(imgElement, path) {
    const src = imgElement.src;
    const response = await fetch(src);
    const blob = await response.blob();
    const file = new File([blob], 'uploaded_image.png', { type: blob.type });

    // Upload to Firebase Storage
    const storageRef = ref(storage, path);
    try {
        const snapshot = await uploadBytes(storageRef, file);
        console.log('Uploaded a blob or file!', snapshot);

        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('File available at', downloadURL);

        return downloadURL;
    } catch (error) {
        console.error('Upload failed', error);
    }
}


//  >>>     Get Functions      <<<


async function getVendorData(user) {
    const vendorCollectionRef = collection(db, 'vendors');
    const vendorQuery = query(vendorCollectionRef, where("uid", "==", user.uid));
    const vendorsSnapshot = await getDocs(vendorQuery);

    if (vendorsSnapshot.empty) {
        return null;
    }

    const vendorDoc = vendorsSnapshot.docs[0];
    const vendor = {
        id: vendorDoc.id,
        ...vendorDoc.data(),
    };

    const driverCollectionRef = collection(db, `vendors/${vendorDoc.id}/drivers`);
    const brandsRef = collection(db, `vendors/${vendorDoc.id}/vehicles`);

    // Use Promise.all to fetch drivers and brands in parallel
    const [driverSnapshot, brandsSnapshot] = await Promise.all([
        getDocs(driverCollectionRef),
        getDocs(brandsRef),
    ]);

    const modelPromises = brandsSnapshot.docs.flatMap(brandDoc => {
        const brand = brandDoc.data();
        if (Array.isArray(brand.models)) {
            return brand.models.map(model => 
                getDocs(collection(db, `vendors/${vendorDoc.id}/vehicles/${brandDoc.id}/${model}`))
            );
        } else {
            console.warn(`No models array found for brand: ${brandDoc.id}`);
            return [];
        }
    });

    const modelSnapshots = await Promise.all(modelPromises);
    const vehicles = modelSnapshots.flatMap(modelSnapshot => 
        modelSnapshot.docs.map(vehicleDoc => ({
            id: vehicleDoc.id,
            ...vehicleDoc.data(),
        }))
    );

    // Helper function for sorting by status
    const sortByStatus = (a, b) => (a.status === "Free!" ? -1 : b.status === "Free!" ? 1 : 0);

    // Filter and sort drivers directly in one step to reduce iterations
    const drivers = driverSnapshot.docs
        .map(driverDoc => {
            const driver = driverDoc.data();
            const totalRatings = driver.rating?.reduce((sum, value) => sum + value, 0) || 0;
            const weightedSum = driver.rating?.reduce((sum, value, index) => sum + (value * index), 0) || 0;
            const averageRating = totalRatings > 0 ? (weightedSum / totalRatings) : 0;

            return {
                id: driverDoc.id,
                ...driver,
                averageRating,
            };
        })
        .filter(driver => !driver.deleted)
        .sort(sortByStatus);

    // Sort vehicles based on status
    vehicles.sort(sortByStatus);

    return {
        ...vendor,
        vehicles,
        drivers,
    };
}

async function getCustomersData(user) {
    const userCollectionRef = collection(db, 'users');
    const userQuery = query(userCollectionRef, where("vendor", "==", user.uid));
    const usersSnapshot = await getDocs(userQuery);
    
    const users = usersSnapshot.docs
    .map(userDoc => ({
        id: userDoc.id,
        ...userDoc.data()
    }))
    .filter(user => !user.deleted);

    const bookingPromises = users.map(async user => {
        const bookingPath = `users/${user.id}/bookings`;
        const bookingsSnapshot = await getDocs(collection(db, bookingPath));

        const bookings = bookingsSnapshot.docs.flatMap(bookingDoc => {
            const bookingData = bookingDoc.data();
            
            // Ensure trips is an array
            const trips = Array.isArray(bookingData.trips) 
                ? bookingData.trips 
                : typeof bookingData.trips === 'object' 
                    ? Object.values(bookingData.trips) 
                    : [];
            
            return trips.map((trip, index) => ({
                id: bookingDoc.id,
                ...trip,
                drivers: typeof trip.drivers === 'object' ? trip.drivers : {}, // Ensure drivers is always an object (map)
                vehicles: typeof trip.vehicles === 'object' ? trip.vehicles : {}, // Ensure vehicles is always an object (map)
                customer: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
                tripIndex: index,
                originalBooking: {
                    ...bookingData,
                    trips: undefined, // Exclude trips from original booking
                }
            }));
        });               

        bookings.sort((a, b) => {
            const dateA = new Date(a.startDate + 'T' + a.pickUpTime + ':00');
            const dateB = new Date(b.startDate + 'T' + b.pickUpTime + ':00');
            return dateB - dateA;
        });

        let previousBookings = [];
        let currentBooking = null;
        let upcomingBookings = [];

        const now = new Date();

        for (const booking of bookings) {
            const { status, updatedAt, drivers, vehicles, price } = booking;
            const tripDate = new Date(booking.id + 'T' + booking.pickUpTime + ':00');
            
            const approved = status === 'Approved!';
            const pending = status === 'Pending...';

            if (tripDate < now && tripDate.toDateString() !== now.toDateString()) {
                if (approved && drivers.length !== 0 ) {
                    const chatId = `${booking.id} > ${user.id}`;
                    const chatRef = doc(db, "chats", chatId);
                    const docSnapshot = await getDoc(chatRef);
                    if (docSnapshot.exists()) {
                        await deleteDoc(chatRef);
                        console.log('Deleted chat document:', chatRef.id);
                    }
                }
                previousBookings.push({ ...booking, bookingId: booking.id, status, updatedAt, drivers, vehicles, price });
            } else if (approved) {
                if (!currentBooking && tripDate.toDateString() === now.toDateString()) {
                    currentBooking = { ...booking, bookingId: booking.id, status, updatedAt, drivers, vehicles, price };
                }
                upcomingBookings.push({ ...booking, bookingId: booking.id, status, updatedAt, drivers, vehicles, price });
            } else if (pending) {
                upcomingBookings.push({
                    ...booking,
                    bookingId: booking.id,
                    status,
                    updatedAt,
                    drivers,
                    vehicles,
                    price
                });                
            }
        }

        previousBookings.sort((a, b) => {
            const dateA = new Date(a.startDate + 'T' + a.pickUpTime + ':00');
            const dateB = new Date(b.startDate + 'T' + b.pickUpTime + ':00');
            return dateB - dateA;
        });

        upcomingBookings.sort((a, b) => {
            const dateA = new Date(a.startDate + 'T' + a.pickUpTime + ':00');
            const dateB = new Date(b.startDate + 'T' + b.pickUpTime + ':00');
            return dateB - dateA;
        });

        return {
            ...user,
            previousBookings,
            currentBooking,
            upcomingBookings,
        };
    });

    const usersWithBookings = await Promise.all(bookingPromises);

    return usersWithBookings;
}

async function getVehicles() {
    try {
        const brandsRef = collection(db, 'vehicles');
        const brandsSnapshot = await getDocs(brandsRef);

        const vehiclesMap = new Map();

        const fetchModelPromises = [];

        for (const brandDoc of brandsSnapshot.docs) {
            const brand = brandDoc.data();

            if (brand.models && Array.isArray(brand.models)) {
                for (const model of brand.models) {
                    const modelRef = collection(db, 'vehicles', brandDoc.id, model);
                    fetchModelPromises.push(getDocs(modelRef).then(modelSnapshot => {
                        for (const vehicleDoc of modelSnapshot.docs) {
                            const vehicle = vehicleDoc.data();
                            const vehicleKey = `${vehicle.model}-${vehicle.fuelEfficiency}`;

                            if (vehiclesMap.has(vehicleKey)) {
                                const existingVehicle = vehiclesMap.get(vehicleKey);

                                if (!existingVehicle.colors.includes(vehicle.color)) {
                                    existingVehicle.colors.push(vehicle.color);
                                    existingVehicle.images.push(vehicle.image);
                                }
                            } else {
                                vehiclesMap.set(vehicleKey, {
                                    id: vehicleDoc.id,
                                    brand: brandDoc.id,
                                    model: vehicle.model,
                                    type: vehicle.type,
                                    seats: vehicle.seats,
                                    fuelEfficiency: vehicle.fuelEfficiency,
                                    fuelType: vehicle.fuelType,
                                    colors: [vehicle.color],
                                    images: [vehicle.image],
                                    uid: vehicleDoc.id
                                });
                            }
                        }
                    }));
                }
            } else {
                console.warn(`No models array found for brand: ${brandDoc.id}`);
            }
        }

        // Process all model snapshots concurrently
        await Promise.all(fetchModelPromises);

        const vehicles = Array.from(vehiclesMap.values());

        return vehicles;
    } catch (error) {
        console.error('Error fetching vehicles:', error);
    }
}

async function getPrices() {
    const pricesRef = collection(db, 'prices');
    
    try {
        const querySnapshot = await getDocs(pricesRef);
        let latestDoc = null;
        let allDocsData = [];

        querySnapshot.forEach((doc) => {
            const docDate = new Date(doc.id);
            allDocsData.push({ id: doc.id, ...doc.data() }); // Store each doc's data
            
            if (!latestDoc || new Date(latestDoc.id) < docDate) {
                latestDoc = doc;
            }
        });

        prices = latestDoc.data();

        return allDocsData; // Return all documents' data
    } catch (error) {
        console.error('Error retrieving the prices documents:', error);
        prices = null;
        return [];
    }
}









/* -----------------------------         Authentication         ------------------------------------ */









async function checkUserAuth(user) {
    if (user) {
        // Define collections and queries
        const collections = [
            { name: 'users', redirect: 'home.html' },
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

function handleSignUpForm() {
    const passwordField = document.getElementById('signPassword');
    const confirmPasswordField = document.getElementById('signConfPassword');
    const signUpForm = document.getElementById('signUpPage').querySelector('form'); // Select the form element
    const nameField = document.getElementById('signName');
    const TelField = document.getElementById('signTel');
    const DepartmentField= document.getElementById('signDepartment');

    // Utility function to update field validity and border color
    const setFieldValidity = (isValid, field, message, color) => {
        field.setCustomValidity(message);
        field.style.borderColor = color;
    };
  
    // Password validation handler
    const validatePasswords = () => {
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;
  
        if (!password && !confirmPassword) {
            setFieldValidity(true, confirmPasswordField, '', '');
            return;
        }
  
        const passwordsMatch = password === confirmPassword;
        setFieldValidity(passwordsMatch, confirmPasswordField, passwordsMatch ? '' : 'Passwords do not match', passwordsMatch ? 'lime' : 'red');
    };

    // Utility function to capitalize the first letter of a string
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    // Function to validate that the name contains at least one space (indicating first and last name)
    const validateName = () => {
        const name = nameField.value.trim();
        if (name.includes(" ")) {
            setFieldValidity(true, nameField, '', 'lime');
            return true;
        } else {
            setFieldValidity(false, nameField, 'Please enter both a first name and a surname', 'red');
            return false;
        }
    };
  
    // Add input event listeners to password fields and name field
    passwordField.addEventListener('input', validatePasswords);
    confirmPasswordField.addEventListener('input', validatePasswords);
    nameField.addEventListener('input', validateName);
  
    // Update this event listener to attach to the form instead of the button
    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        fadeInLoader();
      
        const formData = {
            username: capitalize(nameField.value),
            email: document.getElementById('signEmail').value,
            tel: TelField.value,
            department: DepartmentField.value,
            password: passwordField.value,
            confirmPassword: confirmPasswordField.value,
        };
      
        console.log('Form data:', formData);  // Log the form data for debugging

        // Ensure all fields are filled
        const allFieldsFilled = Object.values(formData).every(field => field.trim() !== '');
        if (!allFieldsFilled) {
            fadeOutLoader();
            alert('Please fill out all fields');
            return;
        }

        // Ensure the name contains both a first and last name
        if (!validateName()) {
            fadeOutLoader();
            alert('Please enter both a first name and a surname');
            return;
        }
      
        // Ensure passwords match
        if (formData.password !== formData.confirmPassword) {
            fadeOutLoader();
            alert('Passwords do not match');
            return;
        }
      
        try {
            // Check if the username is already in use
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('name', '==', formData.username));
            const querySnapshot = await getDocs(q);
      
            if (querySnapshot.size > 0) {
                fadeOutLoader();
                alert('Username is already in use.');
                return;
            }
      
            // Username is available, create the user
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
      
            const customId = `${formData.username} (${user.uid})`;
            const newUserRef = doc(usersRef, customId);
            await setDoc(newUserRef, {
                name: formData.username,
                email: user.email,
                tel: formData.tel,
                uid: user.uid,
                department: formData.department,
                gender: null,
                leaveType: {
                    sickLeave: 0,
                    annualLeave: 0,
                    babyLeave: 0,
                    familyLeave: 0,
                }
            });
      
            fadeOutLoader();
            console.log('User created and data saved successfully');
        } catch (error) {
            fadeOutLoader();
            console.error('Error signing up:', error.message);  // Log the error for debugging
            alert('Error signing up: ' + error.message);
        }
    });      
  
    // Handle password visibility toggle
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('bxs-lock-open') || e.target.classList.contains('bxs-lock')) {
            const inputField = e.target.closest('.input-box').querySelector('input');
            const isPassword = inputField.type === 'password';
            
            inputField.type = isPassword ? 'text' : 'password';
            e.target.classList.toggle('bxs-lock-open', isPassword);
            e.target.classList.toggle('bxs-lock', !isPassword);
        }
    });
}

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









let bookingUpdatedListener;
let availableVehiclesCache = {};
const tripSummary = document.getElementById("tripSummary");
const selectBooking = document.getElementById("selectBooking");


// >>>      Display Booking Helper Functions    <<< 


function displayCustomerBookings(currentDate, customers, myData) {
    const myTrips = document.getElementById("myTrips");
    const myHistory = document.getElementById("myHistory");

    myTrips.innerHTML = "";
    myHistory.innerHTML = "";

    const renderBookingList = (customer, bookings, container, emptyMessage) => {
        // If the bookings array is undefined or empty, show the empty message
        if (!bookings || bookings.length === 0) {
            container.innerHTML = `<p class="empty">${emptyMessage}</p>`;
            return;
        }

        const fragment = document.createDocumentFragment();

        bookings.forEach((booking) => {
            const nameSurname = `${booking.driver?.name ?? 'Name'} ${booking.driver?.surname ?? 'Surname'}`.trim();
            const lastDropOff = booking.dropOffAddresses?.[booking.dropOffAddresses.length - 1];
            const dropOffImage = lastDropOff?.image ?? "Images/gallery.png";
            const dropOffAddress = lastDropOff?.name ?? "Where To?";

            const vehicle = booking?.vehicle || {};
            const {
                brand = "Brand",
                model = "Model",
                index = 0,
            } = vehicle;

            const createdLi = document.createElement("li");
            createdLi.innerHTML = `
                <div class="img">
                    <img src="${dropOffImage}" alt="Map Location Image">
                </div>
                <div class="details">
                    <h1 class="to"><b>${customer.name} ${customer.surname}:</b></h1>
                    <h1 class="to"><b>To:</b> ${dropOffAddress}</h1>
                    <h3 class="from"><b>Date:</b> ${booking.bookingId}</h3>
                    <div class="flex-box">
                        <h5 class="driver">Driver: <br>${nameSurname}</h5>
                        <h5 class="vehicle">Vehicle: <br>${brand} ${model} ${index}</h5>
                    </div>
                    <p class="price"><b>Price:</b> R${booking.price?.total || 0}</p>
                </div>
                <i class="ri-arrow-right-s-line"></i>
            `;

            if (booking.status === "Pending...") {
                createdLi.classList.add("inactive");
            }

            createdLi.addEventListener("click", () => {
                document.querySelector("#home .header").classList.remove("active");
                activateHTML(tripSummary, selectBooking);
                window.history.pushState({ page: "home", action: "selectBooking" }, '', "");
                const valid = booking.status === "Approved!";

                if (valid) {
                    openBooking(currentDate, myData, booking, customer, false);
                } else {
                    openBooking(currentDate, myData, booking, customer, true);
                }
            });

            fragment.appendChild(createdLi);
        });

        container.appendChild(fragment);
    };

    // Iterate through all customers
    customers.forEach(customer => {
        // Safely handle missing or undefined bookings arrays
        const upcomingBookings = customer.upcomingBookings || [];
        const previousBookings = customer.previousBookings || [];
        
        renderBookingList(customer, upcomingBookings.slice(0, 2), myTrips, "No upcoming bookings...");
        renderBookingList(customer, previousBookings.slice(0, 3), myHistory, "No previous bookings.");
    });
}

function displayMoreBookings(myData, customers, container, title) {
    container.innerHTML = `
        <div class="title">
            <h1>${title}:</h1>
        </div>
    `;

    const renderBookingList = (bookings, container, customer) => {
        if (bookings.length === 0) {
            container.innerHTML += `<p class="empty">No ${title.toLowerCase()} bookings for ${customer.name} ${customer.surname}...</p>`;
            return;
        }

        const fragment = document.createDocumentFragment();

        bookings.forEach((booking) => {
            const nameSurname = `${booking.driver?.name ?? 'Name'} ${booking.driver?.surname ?? 'Surname'}`.trim();
            const lastDropOff = booking.dropOffAddresses?.[booking.dropOffAddresses.length - 1];
            const dropOffImage = lastDropOff?.image ?? "Images/gallery.png";
            const dropOffAddress = lastDropOff?.name ?? "Where To?";

            const vehicle = booking?.vehicle || {};
            const {
                brand = "Brand",
                model = "Model",
                index = 0,
            } = vehicle;

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
                        <h5 class="vehicle">Vehicle: <br>${brand} ${model} ${index}</h5>
                    </div>
                    <p class="price"><b>Price:</b> R${booking.price?.total || 0}</p>
                </div>
                <i class="ri-arrow-right-s-line"></i>
            `;

            if (booking.status === "Pending...") {
                createdLi.classList.add("inactive");
            }

            createdLi.addEventListener("click", () => {
                document.querySelector("#home .header").classList.remove("active");
                activateHTML(container, selectBooking);
                window.history.pushState({ page: "home", action: "selectBooking" }, '', "");
                openBooking(currentDate, myData, booking, customer, false);
            });

            fragment.appendChild(createdLi);
        });

        container.appendChild(fragment);
    };

    customers.forEach(customer => {
        const bookings = title === "Upcoming" ? customer.upcomingBookings : customer.previousBookings;
        renderBookingList(bookings, container, customer);
    });
}

function openBooking(currentDate, myData, booking, customer, valid) {
    refreshBookingListener();
    console.log("booking", booking);

    // Destructure booking data with default values
    const { 
        drivers = [{}], 
        vehicles = [{}], 
        dropOffAddresses = [], 
        pickUpAddress = { name: "Unknown Location" }, 
        price = { total: "0" },
    } = booking || {};
    
    // Set up HTML content for the booking
    selectBooking.innerHTML = `
        <div class="addresses"></div>
        <div class="drivers-container">
            <div class="driver-box" id="driverBox">
                <div class="img"><img src="Images/add.png" alt="Driver Image"></div>
                <div class="details">
                    <h1 class="name">Select Driver</h1>
                </div>
                <div class="icon"><i class="ri-arrow-right-s-line"></i></div>
            </div>
        </div>
        <div class="vehicles-container">
            <div class="vehicle-box" id="vehicleBox">
                <div class="img"><img src="Images/add.png" alt="Vehicle Image"></div>
                <div class="details">
                    <h1 class="name">Select Vehicle</h1>
                </div>
                <div class="icon"><i class="ri-arrow-right-s-line"></i></div>
            </div>
        </div>
        <div class="expense-box">
            <div class="total">
                <h3>Expense Total:</h3>
                <span>R${price.total}</span>
            </div>
            <div class="details"></div>
        </div>
        <button id="saveDetails">
            <i class="ri-save-3-fill"></i> Save Details
        </button>
    `;

    const addressesContainer = selectBooking.querySelector(".addresses");
    const driversContainer = selectBooking.querySelector(".drivers-container");
    const vehiclesContainer = selectBooking.querySelector(".vehicles-container");

    // Generate and populate addresses
    const generateAddressHTML = (icon, title, address) => `
        <div class="address-box">
            <div class="address">
                <span>${title}:</span>
                <p>${address}</p>
            </div>
            <div class="icon"><i class="${icon}"></i></div>
        </div>`;

    // Generate addresses for pick-up and drop-off locations
    const dropOffHTML = dropOffAddresses.map((addr, index) => generateAddressHTML(
        "ri-pin-distance-fill", 
        index === dropOffAddresses.length - 1 ? "Drop Off" : `Stop ${index + 1}`, 
        addr.name || "Unknown Location"
    )).join("");

    addressesContainer.innerHTML = generateAddressHTML("ri-map-pin-2-fill", "Pick Up", pickUpAddress.name) + dropOffHTML;

    // Helper to generate driver and vehicle HTML
    const generateHTML = (type, data, index) => {
        if (type === 'driver') {
            const { image = "Images/gallery.png", name = "Driver's Name", averageRating = "0" } = data;
            return `
                <div class="driver-box" data-driver-index="${index}">
                    <div class="img"><img src="${image}" alt="Driver Image"></div>
                    <div class="details">
                        <h1 class="name">${name}</h1>
                        <h3 class="rating">${averageRating} <i class="ri-shield-star-fill"></i></h3>
                    </div>
                </div>`;
        } else if (type === 'vehicle') {
            const { brand = "Brand", model = "Model", seats = "0", fuelEfficiency = "0", fuelType = "Unknown", images = ["Images/land-rover.png"], colors = ["White"] } = data;
            return `
                <div class="vehicle-box" data-vehicle-index="${index}">
                    <div class="img"><img src="${images[0]}" alt="Vehicle Image"></div>
                    <div class="details">
                        <h1 class="name">${brand} ${model}</h1>
                        <h3 class="color">Colour: ${colors[0]}</h3>
                        <h3 class="seats">Seats: ${seats}</h3>
                        <h3 class="fuel">Fuel Efficiency: ${fuelEfficiency} Km/L</h3>
                        <h3 class="fuel">Fuel Type: ${fuelType}</h3>
                    </div>
                </div>`;
        }
    };

    // Add event listeners if booking is valid
    if (Object.keys(drivers).length === 0 && Object.keys(vehicles).length === 0) {
        // Event listener for driver selection
        driversContainer.querySelector("#driverBox").addEventListener("click", () => {
            const viewDrivers = document.querySelector("#home #viewDrivers");
            displayDriversList(myData, myData.drivers, viewDrivers, booking);
            activateHTML(selectBooking, viewDrivers);
            window.history.pushState({ page: "home", action: "viewDrivers" }, '', "");
        });

        // Event listener for vehicle selection
        vehiclesContainer.querySelector("#vehicleBox").addEventListener("click", () => {
            const container = document.querySelector("#home #viewVehicles");
            displayVehiclesList(myData, myData.vehicles, container, booking);
            activateHTML(selectBooking, container);
            window.history.pushState({ page: "home", action: "viewVehicles" }, '', "");
        });

        setupBookingListener(myData, booking, valid);
    } else {
        selectBooking.querySelector("#saveDetails").style.display = "none";
        driversContainer.innerHTML = Object.values(drivers).map((driver, index) => generateHTML('driver', driver, index)).join("");
        vehiclesContainer.innerHTML = Object.values(vehicles).map((vehicle, index) => generateHTML('vehicle', vehicle, index)).join("");

        // Update expense details when booking is not valid
        updateExpenseDetails(drivers, vehicles, myData, booking, valid);
    }

    // Save details event listener
    selectBooking.querySelector("#saveDetails").addEventListener("click", () => {
        const selectedDrivers = JSON.parse(localStorage.getItem('selectedDrivers')) || {}; // Treat as object
        const selectedVehicles = JSON.parse(localStorage.getItem('selectedVehicles')) || {};
        console.log("Saving details...", { selectedDrivers, selectedVehicles });
        saveBookingDetails(myData, booking, selectedDrivers, selectedVehicles, customer);
    });
}


// >>>      Selected Booking Helper Functions    <<< 


function updateExpenseDetails(selectedDrivers, selectedVehicles, myData, booking, valid) {
    const selectBooking = document.getElementById('selectBooking');
    const totalElement = selectBooking.querySelector(".expense-box .total");
    const detailsElement = selectBooking.querySelector(".expense-box .details");

    // Clear previous expense items to avoid duplication
    detailsElement.innerHTML = "";
    let totalCost = 0;
    const expenseItems = {};

    // If no drivers or vehicles are selected, show a message and update the total cost
    if (Object.keys(selectedVehicles).length === 0 && Object.keys(selectedDrivers).length === 0) {
        totalElement.innerHTML = `
            <h3>Expense Details:</h3>
            <span>R${totalCost.toFixed(2)}</span>
        `;
        return;
    }

    // Add an expense item and log it, ensuring cost is positive
    const addExpenseItem = (id, label, cost, isEditable = false) => {
        cost = Math.max(cost, 0); // Ensure cost is non-negative

        expenseItems[id] = { label, cost, isEditable };

        const itemHTML = `
            <div class="text" data-id="${id}">
                ${isEditable ? "<i class='bx bxs-edit-alt edit-icon'></i>" : ""}
                <p class="item-label">${label}</p>
                <p class="item-price">R${cost.toFixed(2)}</p>
            </div>
        `;
        detailsElement.insertAdjacentHTML('beforeend', itemHTML);

        // Attach edit event listener if editable
        if (isEditable) {
            const editIcon = detailsElement.querySelector(`.text[data-id="${id}"] .edit-icon`);
            if (editIcon) {
                editIcon.addEventListener('click', () => {
                    // Implement the logic to handle editing the item
                    turnItemIntoEditable(id);
                    // Hide the edit icon after it is clicked
                    editIcon.style.display = 'none';
                });
            }
        }
    };

    // Function to handle turning the price into an input field for editing
    const turnItemIntoEditable = (id) => {
        const itemElement = detailsElement.querySelector(`.text[data-id="${id}"]`);
        const item = expenseItems[id];

        if (item) {
            // The label remains static
            const labelElement = itemElement.querySelector('.item-label');
            labelElement.innerHTML = `
                <input type="number" class="item-label-input" value="${item.cost.toFixed(2)}"\>
            `;

            // Turn the price into an input field with the current price value
            const priceElement = itemElement.querySelector('.item-price');
            priceElement.innerHTML = `
                <i class='ri-save-3-fill'></i>
            `;

            // Attach the save icon functionality
            const saveIcon = itemElement.querySelector('.ri-save-3-fill');
            saveIcon.addEventListener('click', () => {
                saveUpdatedItem(id);
            });
        }
    };

    // Function to save the updated item after editing
    const saveUpdatedItem = (id) => {
        const itemElement = detailsElement.querySelector(`.text[data-id="${id}"]`);
        const item = expenseItems[id];

        // Get the new price from the input field
        const newPrice = parseFloat(itemElement.querySelector('.item-label-input').value) || 0;

        // Update the expense item object
        item.cost = newPrice;

        // Update the UI with the new values
        const priceElement = itemElement.querySelector('.item-price');
        priceElement.innerHTML = `R${newPrice.toFixed(2)}`;

        // Update the total cost after saving the changes
        updateTotalCost();
    };

    // Calculate driver expenses
    Object.keys(selectedDrivers).forEach((driverId, index) => {
        const driver = selectedDrivers[driverId];

        const driverCost = Math.max(parseFloat(driver.averageRating) * 10 || 0, 0);
        const driverLabel = `${driver.name} ${driver.surname} Commission:`;
        const expenseId = `driver-cost-${driverId}`;
        addExpenseItem(expenseId, driverLabel, driverCost, valid);
    });

    // Calculate vehicle expenses
    Object.keys(selectedVehicles).forEach((vehicleId) => {
        const vehicle = selectedVehicles[vehicleId];

        const distance = Math.max(parseFloat(booking.totalDistance) || 0, 0); 
        const fuelPriceMap = {
            'Unleaded 93': prices.unleaded93,
            'Unleaded 95': prices.unleaded95,
            'Diesel 50': prices.diesel50,
            'Diesel 500': prices.diesel500
        };
        const fuelCostPerLiter = Math.max(fuelPriceMap[vehicle.fuelType] || 0, 0); 
        const vehicleCost = Math.max((distance / vehicle.fuelEfficiency) * fuelCostPerLiter || 0, 0);
        const vehicleLabel = `${vehicle.colors[0]} ${vehicle.brand} ${vehicle.model} ${vehicle.index} Fuel Cost:`;
        const expenseId = `vehicle-cost-${vehicleId}`;
        addExpenseItem(expenseId, vehicleLabel, vehicleCost, false);
    });

    // Update total cost
    const updateTotalCost = () => {
        totalCost = Math.max(Object.values(expenseItems).reduce((sum, item) => sum + item.cost, 0), 0);
        totalElement.innerHTML = `
            <h3>Expense Details:</h3>
            <span>R${totalCost.toFixed(2)}</span>
        `;
    };

    updateTotalCost();

    // Handle markup
    let markUp = Math.max(booking.price.total - totalCost, 0);
    addExpenseItem("markup", "Mark Up:", markUp, valid);

    // Update total cost again after markup is added
    updateTotalCost();
}

async function displayDriversList(myData, drivers, container, booking) {
    fadeInLoader(); // Show loader at the start
    container.innerHTML = "";

    if (drivers.length === 0) {
        container.innerHTML = `<p class="empty">No drivers inside your organisation...</p>`;
        fadeOutLoader(); // Hide loader if no drivers are found
        return;
    }

    const fragment = document.createDocumentFragment();
    const totalDrivers = drivers.length; // Total number of drivers
    let processedDrivers = 0; // Track the number of processed drivers

    // Retrieve selected drivers from localStorage once (store as object)
    let selectedDrivers = JSON.parse(localStorage.getItem('selectedDrivers')) || {};

    // Update the loader progress
    const updateProgress = () => {
        const progress = Math.round((processedDrivers / totalDrivers) * 100);
        updateProgressBar(progress); // Assume you have a function to update progress
    };

    // Loop through drivers and process them
    for (const driver of drivers) {
        const { name = 'Name', surname = 'Surname', averageRating = '0', image = "Images/gallery.png", id } = driver;

        // Skip if driver is already selected
        if (selectedDrivers[id]) {
            processedDrivers++;
            updateProgress();
            continue;
        }

        // Check availability of the driver for this booking
        const ref = doc(db, "vendors", myData.id, "drivers", id, "bookings", booking.id);
        const available = await checkAvailability(ref, booking.bookingId, booking.pickUpTime);

        // Skip if the driver is unavailable
        if (!available) {
            processedDrivers++;
            updateProgress();
            continue;
        }

        const nameSurname = `${name} ${surname}`.trim();

        // Create driver list item
        const createdLi = document.createElement("li");
        createdLi.innerHTML = `
            <div class="img">
                <img src="${image}" alt="Driver Image">
            </div>

            <div class="details">
                <h1 class="name">${nameSurname}</h1>
                <h3 class="rating">${averageRating} <i class="ri-shield-star-fill"></i></h3>
            </div>

            <div class="icon">
                <i class="ri-add-line"></i>
            </div>
        `;

        createdLi.addEventListener("click", () => handleDriverSelection(driver));

        fragment.appendChild(createdLi);

        processedDrivers++;
        updateProgress(); // Update loader progress
    }

    function handleDriverSelection(driver) {
        const { id, name, surname, averageRating, image } = driver;

        let selectedDrivers = JSON.parse(localStorage.getItem('selectedDrivers')) || {};

        if (!selectedDrivers[id]) {
            // Add driver using its id as the key
            selectedDrivers[id] = driver;
            localStorage.setItem('selectedDrivers', JSON.stringify(selectedDrivers));

            // Dispatch booking updated event
            document.dispatchEvent(new Event('bookingUpdated'));

            addDriverBox(driver);
            history.back();
        } else {
            console.log(`Driver already selected: ${name} ${surname} (${id})`);
        }
    }

    // Separate function to add driver box and attach the remove listener
    function addDriverBox(driver) {
        const { id, name, surname, averageRating, image } = driver;
        const driverId = `driver-${id}`;

        // Create the driver box
        const driverBox = `
            <div class="driver-box added-driver" id="${driverId}">
                <div class="img"><img src="${image}" alt="Driver Image"></div>
                <div class="details">
                    <h1 class="name">${name} ${surname}</h1>
                    <h3 class="rating">${averageRating} <i class="ri-shield-star-fill"></i></h3>
                </div>
                <div class="icon"><i class="ri-close-line"></i></div>
            </div>
        `;

        const container = document.querySelector(".drivers-container");
        container.insertAdjacentHTML('beforeend', driverBox);

        // Get the new driver DOM element and attach the event listener to the close icon
        const driverElement = document.getElementById(driverId);
        const removeIcon = driverElement.querySelector(".icon");

        // Attach the event listener for removing the driver
        removeIcon.addEventListener("click", () => removeDriver(driverId));
    }

    function removeDriver(driverId) {
        const id = driverId.replace('driver-', ''); // Extract actual id

        console.log(`Removed driver with id: ${id}`);

        // Remove the driver by its id from the selectedDrivers object
        let selectedDrivers = JSON.parse(localStorage.getItem('selectedDrivers')) || {};

        if (selectedDrivers[id]) {
            delete selectedDrivers[id];

            console.log("Updated selectedDrivers after removal", selectedDrivers);

            // Update localStorage with the new selectedDrivers object
            localStorage.setItem('selectedDrivers', JSON.stringify(selectedDrivers));

            // Dispatch booking updated event
            document.dispatchEvent(new Event('bookingUpdated'));

            // Remove the driver element from the DOM
            document.getElementById(driverId).remove();
        } else {
            console.log(`Driver with id ${id} not found in selectedDrivers.`);
        }
    }

    container.appendChild(fragment);
    fadeOutLoader(); // Hide loader when done
}

async function displayVehiclesList(myData, vehicles, container, booking) {
    fadeInLoader(); // Show loader at the start
    container.innerHTML = "";

    if (!vehicles.length) {
        console.log("No vehicles found in the fleet.");
        container.innerHTML = `<p class="empty">No Vehicles inside your fleet.</p>`;
        fadeOutLoader(); // Hide loader if no vehicles are found
        return;
    }

    const fragment = document.createDocumentFragment();
    const totalVehicles = vehicles.length;
    let processedVehicles = 0;

    // Retrieve selected vehicles from localStorage once (store as object)
    let selectedVehicles = JSON.parse(localStorage.getItem('selectedVehicles')) || {};

    // Update progress bar based on processed vehicles
    const updateProgress = () => {
        const progress = Math.round((processedVehicles / totalVehicles) * 100);
        updateProgressBar(progress);
    };

    // Loop through vehicles and process them
    for (const vehicle of vehicles) {
        const { colors = [], model, brand, index, images, seats = '0', fuelEfficiency = '0', fuelType = '0', id } = vehicle;

        // Skip if vehicle is already selected
        if (selectedVehicles[id]) {
            processedVehicles++;
            updateProgress();
            continue;
        }

        const ref = doc(db, "vendors", myData.id, "vehicles", id, "bookings", booking.id);
        const available = await checkAvailability(ref, booking.bookingId, booking.pickUpTime);

        // Skip if vehicle is unavailable
        if (!available) {
            processedVehicles++;
            updateProgress();
            continue;
        }

        // Create vehicle list item
        const vehicleLi = document.createElement("li");
        vehicleLi.innerHTML = `
            <div class="img">
                <img src="${images[0]}" alt="Vehicle Image">
            </div>
            <div class="details">
                <h1 class="name">${brand} ${model} ${index}</h1>
                <h3 class="seats">Seats: ${seats}</h3>
                <h3 class="fuel">Fuel Efficiency: ${fuelEfficiency} Km/L</h3>
                <h3 class="fuel">Fuel Type: ${fuelType}</h3>
            </div>
            <div class="icon">
                <i class="ri-add-line"></i>
            </div>
        `;

        vehicleLi.addEventListener("click", () => handleVehicleSelection(vehicle));

        fragment.appendChild(vehicleLi);

        processedVehicles++;
        updateProgress();
    }

    function handleVehicleSelection(vehicle) {
        const { id, brand, model, index, images, seats, fuelEfficiency, fuelType } = vehicle;

        let selectedVehicles = JSON.parse(localStorage.getItem('selectedVehicles')) || {};

        if (!selectedVehicles[id]) {
            // Add vehicle using its id as the key
            selectedVehicles[id] = vehicle;
            localStorage.setItem('selectedVehicles', JSON.stringify(selectedVehicles));

            // Dispatch booking updated event
            document.dispatchEvent(new Event('bookingUpdated'));

            addVehicleBox(vehicle);
            history.back();
        } else {
            console.log(`Vehicle already selected: ${brand} ${model} (${id})`);
        }
    }

    // Separate function to add vehicle box and attach the remove listener
    function addVehicleBox(vehicle) {
        const { id, brand, model, index, images, seats, fuelEfficiency, fuelType } = vehicle;
        const vehicleId = `vehicle-${id}`;

        // Create the vehicle box
        const vehicleBox = `
            <div class="vehicle-box added-vehicle" id="${vehicleId}">
                <div class="img"><img src="${images[0]}" alt="Vehicle Image"></div>
                <div class="details">
                    <h1 class="name">${brand} ${model} ${index}</h1>
                    <h3 class="seats">Seats: ${seats}</h3>
                    <h3 class="fuel">Fuel Efficiency: ${fuelEfficiency} Km/L</h3>
                    <h3 class="fuel">Fuel Type: ${fuelType}</h3>
                </div>
                <div class="icon"><i class="ri-close-line"></i></div>
            </div>
        `;

        const container = document.querySelector(".vehicles-container");
        container.insertAdjacentHTML('beforeend', vehicleBox);

        // Get the new vehicle DOM element and attach the event listener to the close icon
        const vehicleElement = document.getElementById(vehicleId);
        const removeIcon = vehicleElement.querySelector(".icon");

        // Attach the event listener for removing the vehicle
        removeIcon.addEventListener("click", () => removeVehicle(vehicleId));
    }

    function removeVehicle(vehicleId) {
        const id = vehicleId.replace('vehicle-', ''); // Extract actual id

        console.log(`Removed vehicle with id: ${id}`);

        // Remove the vehicle by its id from the selectedVehicles object
        let selectedVehicles = JSON.parse(localStorage.getItem('selectedVehicles')) || {};
        let selectedDrivers = JSON.parse(localStorage.getItem('selectedDrivers')) || [];

        if (selectedVehicles[id]) {
            delete selectedVehicles[id];

            console.log("Updated selectedVehicles after removal", selectedVehicles);

            // Update localStorage with the new selectedVehicles object
            localStorage.setItem('selectedVehicles', JSON.stringify(selectedVehicles));

            // Dispatch booking updated event
            document.dispatchEvent(new Event('bookingUpdated'));

            // Remove the vehicle element from the DOM
            document.getElementById(vehicleId).remove();

            // Update expense details immediately after removing the vehicle
            updateExpenseDetails(selectedDrivers, selectedVehicles, myData, booking, true);
        } else {
            console.log(`Vehicle with id ${id} not found in selectedVehicles.`);
        }
    }

    container.appendChild(fragment);
    fadeOutLoader(); 
}


// >>>      Booking Listener Helper Functions    <<< 


function setupBookingListener(myData, booking, valid) {
    const updateDetails = () => {
        const selectedDrivers = JSON.parse(localStorage.getItem('selectedDrivers')) || {}; // Treat as object
        const selectedVehicles = JSON.parse(localStorage.getItem('selectedVehicles')) || {};
        console.log('selectedDrivers:', selectedDrivers);
        console.log('selectedVehicles:', selectedVehicles);

        // Check if there are any selected drivers or vehicles
        if (Object.keys(selectedVehicles).length > 0 || Object.keys(selectedDrivers).length > 0) {
            updateExpenseDetails(selectedDrivers, selectedVehicles, myData, booking, valid);
        } else {
            console.log("No drivers or vehicles selected, skipping expense calculation.");
        }
    };

    // Save the reference to the listener function
    bookingUpdatedListener = updateDetails;

    // Listen for custom events indicating driver or vehicle update
    document.addEventListener('bookingUpdated', bookingUpdatedListener);

    // Initial update based on current storage values
    updateDetails();
}

function refreshBookingListener() {
    if (bookingUpdatedListener) {
        document.removeEventListener('bookingUpdated', bookingUpdatedListener);
    }

    // Clear the localStorage for selected drivers and vehicles
    localStorage.removeItem('selectedDrivers');
    localStorage.removeItem('selectedVehicles');
}


// >>>      Booking Listener Helper Functions    <<< 


function filterBookings(myData, customers, container, searchTerm) {
    const filteredCustomersWithBookings = customers.filter(customer => {
        return customer.upcomingBookings.some(booking => {
            const matchesName = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                customer.surname.toLowerCase().includes(searchTerm.toLowerCase());
                
            const matchesAddress = booking.pickUpAddress.address.toLowerCase().includes(searchTerm.toLowerCase()) || 
                booking.dropOffAddresses.some(dropOff => dropOff.address.toLowerCase().includes(searchTerm.toLowerCase()));
                
            const matchesDriver = booking.driver && (
                booking.driver.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                booking.driver.surname.toLowerCase().includes(searchTerm.toLowerCase())
            );
                
            const matchesVehicle = booking.vehicle && (
                booking.vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) || 
                booking.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
            );

            return matchesName || matchesAddress || matchesDriver || matchesVehicle;
        });
    });

    // Clear the current vehicle display
    container.innerHTML = '';

    // Display the filtered bookings
    displayMoreBookings(myData, filteredCustomersWithBookings, container, "Upcoming");
}

async function checkAvailability(ref, date, time) {
    const cacheKey = `${ref.path}-${date}-${time}`;

    // Check if the availability has already been cached
    if (availableVehiclesCache[cacheKey] !== undefined) {
        return availableVehiclesCache[cacheKey]; // Return cached value
    }

    try {
        const snapShot = await getDoc(ref);
        const data = snapShot.data();

        if (!data) {
            availableVehiclesCache[cacheKey] = true; // Cache unavailable vehicle as true
            return true; // No snapshot found, assume available
        }

        // Inline parsing time to minutes
        const pickUpTimeParts = data.pickUpTime.split(':').map(Number);
        const pickUpTimeMinutes = pickUpTimeParts[0] * 60 + pickUpTimeParts[1];

        const requestedTimeParts = time.split(':').map(Number);
        const requestedTimeMinutes = requestedTimeParts[0] * 60 + requestedTimeParts[1];

        // If the requested time is before the pick-up time, vehicle is available
        if (requestedTimeMinutes <= pickUpTimeMinutes) {
            availableVehiclesCache[cacheKey] = true;
            return true;
        }

        // Calculate drop-off time in minutes
        const dropOffTimeMinutes = pickUpTimeMinutes + (data.estimatedDuration * 60) + 10; // Add 10 minutes buffer

        // Check if the requested time is after the drop-off time
        const available = requestedTimeMinutes > dropOffTimeMinutes;

        // Cache the result
        availableVehiclesCache[cacheKey] = available;

        return available;
    } catch (error) {
        console.error("Error checking vehicle availability:", error);
        return false;
    }
}

async function saveBookingDetails(myData, booking, drivers, vehicles, customer) {
    // Ensure totalExpense is a valid number
    const expenseText = document.querySelector(".expense-box .total").textContent;
    const expenseMatch = expenseText.match(/R?(\d+(\.\d{1,2})?)/); // This regex finds the first occurrence of a number in the string
    const expense = expenseMatch ? parseFloat(expenseMatch[1]) : NaN;

    // Log expense value
    console.log("Parsed expense:", expense);

    try {
        const { bookingId, tripIndex } = booking;
        console.log("Booking ID:", bookingId);
        console.log("Trip Index:", tripIndex);

        const bookingRef = doc(db, "users", customer.id, "bookings", bookingId);

        // Fetch the current booking document from Firestore
        console.log("Fetching booking document...");
        const bookingDoc = await getDoc(bookingRef);
        let bookingData = bookingDoc.data();
        console.log("Booking data fetched:", bookingData);

        // Convert trips to an array if it's not already an array
        if (!Array.isArray(bookingData.trips)) {
            console.warn("Trips data is not an array. Converting...");
            bookingData.trips = Object.keys(bookingData.trips).map(key => bookingData.trips[key]);
        }

        console.log("Trips data:", bookingData.trips);

        // Retrieve and structure the price map from expense items
        const priceMap = {};
        document.querySelectorAll(".expense-box .details .text").forEach(item => {
            const label = item.querySelector(".item-label").textContent;
            const priceText = item.querySelector(".item-price").textContent;
            const priceValue = parseFloat(priceText.replace('R', '')) || 0;
            priceMap[label] = priceValue;
        });

        console.log("Price map:", priceMap);

        // Log the current state of the trip being updated
        const currentTripData = bookingData.trips[tripIndex];
        console.log("Current trip data for index", tripIndex, ":", currentTripData);

        // Directly update the array element
        const updatedTripData = {
            ...currentTripData,
            status: "Approved!",
            customer: {
                id: customer.id,
                image: customer.image,
                name: customer.name,
                surname: customer.surname,
                uid: customer.uid
            },
            price: {
                total: expense,
                ...priceMap
            },
        };
        console.log("Updated trip data:", updatedTripData);

        // Use a Firestore batch for more efficient writing
        const batch = writeBatch(db);

        // Log drivers and vehicles before saving them
        console.log("Drivers:", drivers);
        console.log("Vehicles:", vehicles);

        if (drivers && typeof drivers === 'object') {
            updatedTripData.drivers = {};
            for (const driverKey in drivers) {
                if (drivers.hasOwnProperty(driverKey)) {
                    const driver = drivers[driverKey];
                    updatedTripData.drivers[driverKey] = driver;

                    console.log("Saving booking under driver:", driver.id);
                    const driverBookingRef = doc(db, "vendors", myData.id, "drivers", driver.id, "bookings", bookingId);

                    // Fetch the existing driver document
                    const driverDoc = await getDoc(driverBookingRef);
                    let driverTrips = driverDoc.exists() && Array.isArray(driverDoc.data().trips) ? driverDoc.data().trips : [];

                    // Add the new trip to the existing trips array or create a new array if it doesn't exist
                    driverTrips.push(updatedTripData);

                    // Set the updated trips array back to the driver document
                    batch.set(driverBookingRef, {
                        startDate: bookingId,
                        trips: driverTrips
                    }, { merge: true });
                }
            }
        }

        if (vehicles && typeof vehicles === 'object') {
            updatedTripData.vehicles = {};
            for (const vehicleKey in vehicles) {
                if (vehicles.hasOwnProperty(vehicleKey)) {
                    const vehicle = vehicles[vehicleKey];
                    updatedTripData.vehicles[vehicleKey] = vehicle;

                    console.log("Saving booking under vehicle:", vehicle.id);
                    const vehicleBookingRef = doc(db, "vendors", myData.id, "vehicles", vehicle.brand, vehicle.model, vehicle.id, "bookings", bookingId);

                    // Fetch the existing vehicle document
                    const vehicleDoc = await getDoc(vehicleBookingRef);
                    let vehicleTrips = vehicleDoc.exists() && Array.isArray(vehicleDoc.data().trips) ? vehicleDoc.data().trips : [];

                    // Add the new trip to the existing trips array or create a new array if it doesn't exist
                    vehicleTrips.push(updatedTripData);

                    // Set the updated trips array back to the vehicle document
                    batch.set(vehicleBookingRef, {
                        startDate: bookingId,
                        trips: vehicleTrips
                    }, { merge: true });
                }
            }
        }

        bookingData.trips[tripIndex] = updatedTripData;
        batch.set(bookingRef, { trips: bookingData.trips }, { merge: true });

        // Commit the batch write
        await batch.commit();
        history.back();
        window.location.reload();
    } catch (error) {
        console.error("Error saving booking details:", error);
        alert("Failed to save booking details. Please try again.");
    }
}








/* -----------------------------         Main (Drivers)         ------------------------------------ */









const driverSummary = document.getElementById("driverSummary");
const selectDriver = document.getElementById("selectDriver");
const moreDrivers = document.getElementById("seeMoreDrivers");

function displayDrivers(currentDate, drivers, myData) {
    const enRoute = document.querySelector("#driverSummary #enRoute")
    const myDrivers = document.getElementById("myDrivers");

    enRoute.innerHTML = "";
    myDrivers.innerHTML = "";

    renderDriverList(myData, activeDrivers.slice(0, 2), enRoute, "No drivers on the road...");
    renderDriverList(myData, drivers.slice(0, 3), myDrivers, "Add your first driver...");
}

function displayMoreDrivers(currentDate, myData, drivers, title, emptyMsg) {
    moreDrivers.innerHTML = `
        <div class="title">
            ${title}            
        </div>

        <ul class="content"></ul>
    `;

    renderDriverList(myData, drivers, moreDrivers.querySelector(".content"), emptyMsg);

    const addBtn = moreDrivers.querySelector(".ri-add-line");

    if (addBtn) {
        addBtn.addEventListener("click", () => {
            const createDriver = document.querySelector("#drivers #createDriver");
            const activePage = document.querySelector("#drivers .page.active");

            activateHTML(activePage, createDriver);
            document.querySelector("#drivers .header").classList.remove("active");
            window.history.pushState({ page: "drivers", action: "addDriver" }, '', "");

            document.getElementById("addDriver").addEventListener("click", () => {
                addDriver(myData);
            })
        });
    }
}

function displayAllDrivers(myData, container) {
    const viewDrivers = document.querySelector("#drivers #viewDrivers");
    viewDrivers.innerHTML = "";

    const fragment = document.createDocumentFragment();

    // Store driver count by model and color
    const driverCountMap = {};

    allDrivers.forEach((driver, driverIndex) => { 
        const brandModel = `${driver?.brand ?? 'Brand'} ${driver?.model ?? 'Model'}`.trim();
        const experience = driver?.experience ?? "0 years";
        const image = driver?.images?.[0] ?? "Images/gallery.png";  
        const ratings = driver?.ratings ?? "N/A";
        const licenses = driver?.licenses;

        const createdLi = document.createElement("li");
        createdLi.innerHTML = `
            <div class="img">
                <img src="${image}" alt="Driver Image">
            </div>
            <div class="details">
                <h1 class="name">${brandModel}:</h1>
                <h3 class="licenses"><b>Licenses:</b> ${licenses.join(', ')}</h3>
                <h3 class="ratings"><b>Ratings:</b> ${ratings}</h3>
                <h3 class="experience"><b>Experience:</b> ${experience}</h3>
            </div>
            <div class="icon">
                <i class="ri-add-line"></i>
            </div>
        `;

        if (licenses.length > 1) {
            createdLi.querySelector(".icon").innerHTML = `
                <i class="ri-arrow-right-s-line"></i>
            `;
        }

        createdLi.addEventListener("click", async () => {
            fadeInLoader();

            const showPopup = () => {
                fadeOutLoader();
                document.querySelector(".popUp-box").classList.add("active");
                const popUp = document.querySelector(".popUp-box .popUp");
                popUp.innerHTML = `
                    <ul class="license-list">
                    </ul>
                `;

                const licenseList = popUp.querySelector(".license-list");

                licenses.forEach((license, licenseIndex) => {
                    const image = driver.images[licenseIndex];
                    licenseList.innerHTML += `
                        <li class="license-item" data-image-index="${licenseIndex}" data-license="${license}">
                            <img src="${image}" alt="${license}">
                            <p>${license}</p>
                            <i class="ri-add-line"></i>
                        </li>`;
                });

                licenseList.querySelectorAll(".license-item").forEach(item => {
                    item.addEventListener("click", async () => {
                        fadeInLoader();
                        const selectedLicense = item.dataset.license;
                        const imageIndex = item.dataset.imageIndex;
                        const selectedImage = driver.images[imageIndex];

                        await saveDriver(selectedLicense, selectedImage);

                        popUp.innerHTML = "";
                        document.querySelector(".popUp-box").classList.remove("active");

                        console.log(`Saved driver with license: ${selectedLicense}`);
                    });
                });
            };

            const saveDriver = async (license, image) => {
                // Increment the index for the driver's license and model
                const key = `${driver.model}_${license}`;
                if (!driverCountMap[key]) {
                    driverCountMap[key] = 1;
                } else {
                    driverCountMap[key]++;
                }

                const customId = `${license}_${driver.model}_${driverCountMap[key]}`;
                createdLi.querySelector(".icon").innerHTML = `
                    <i class="ri-check-line"></i>
                `;

                const brandRef = doc(db, "vendors", myData.id, "drivers", driver.brand);

                const brandDoc = await getDoc(brandRef);
                let modelsArray = [];

                if (brandDoc.exists() && brandDoc.data().models) {
                    modelsArray = brandDoc.data().models;
                }

                if (!modelsArray.includes(driver.model)) {
                    modelsArray.push(driver.model);
                }

                await setDoc(brandRef, {
                    models: modelsArray
                }, { merge: true });

                const driverRef = doc(db, "vendors", myData.id, "drivers", driver.brand, driver.model, customId);

                console.log("license", license, "image", image);
                
                await setDoc(driverRef, {
                    uid: customId,
                    licenses: [license], // Only save the selected license
                    images: [image],
                    index: driverCountMap[key],
                    brand: brandDoc.id,
                    model: driver.model,
                    type: driver.type,
                    experience: driver.experience,
                    fuelEfficiency: driver.fuelEfficiency,
                });

                fadeOutLoader();
            }

            if (licenses.length === 1) {
                saveDriver(licenses[0], driver.images[0]);
            } else {
                showPopup();
            }
        });

        fragment.appendChild(createdLi);
    });

    viewDrivers.appendChild(fragment);
}

function openDriver(currentDate, myData, driver) {
    console.log("driver", driver);

    const brand = driver?.brand ?? 'Brand';
    const model = driver?.model ?? 'Model';
    const type = driver?.type ?? 'Type';
    const experience = driver?.experience ?? "0 years";
    const image = driver?.images[0] ?? "Images/gallery.png";  // Use the first image if available
    const ratings = driver?.ratings;  // Use the first rating if available
    const licenses = driver?.licenses;  // Use the first license if available

    const booking = driver?.booking || {};
    const dropOffAddresses = booking?.dropOffAddresses || [];
    const pickUpAddress = booking?.pickUpAddress || {};
    const eta = booking?.pickUpTime || "";
    const price = booking?.price || "";

    const dropOffAddressNames = dropOffAddresses.map(addr => addr.name);

    // Update the container's HTML
    selectDriver.innerHTML = `
        <div class="top">
            <i class="ri-save-3-fill" style="display: none" id="saveDetails"></i>
            <i class='bx bxs-edit-alt' id="editDetails"></i>

            <div class="img">
                <img src="${image}" alt="Driver Image">
            </div>

            <div class="details">
                <h1 class="name">${brand} ${model} ${driver.index}</h1>
                <h3 class="type">${type}</h3>
                <h5 class="experience"><b>Experience:</b> ${experience}</h5>
                <h5 class="licenses"><b>Licenses:</b> ${licenses}</h5>
                <h5 class="ratings"><b>Ratings:</b> ${ratings}</h5>
            </div>
        </div>

        <div class="input-box" style="width: 300px;">
            <input type="date" class="date" name="driverDate" id="driverDate" required>
            <i class="ri-calendar-todo-fill"></i>
            <span>Select Date...</span>
        </div>

        <ul class="bottom">
            <li>

            </li>
        </ul>
    `;

    const editDetails = selectDriver.querySelector('#editDetails');
    const saveDetails = selectDriver.querySelector('#saveDetails');
    const details = selectDriver.querySelector('.details');

    editDetails.addEventListener('click', () => {
        details.innerHTML = `
            <h1 class="name">${brand} ${model}</h1>
            <h3 class="type">${type}</h3>
    
            <div class="input-box" style="width: 100%;">
                <input type="text" class="input experience" value="${experience}" required>
                <i class="ri-edit-line"></i>
                <span>Experience...</span>
            </div>
    
            <div class="input-box" style="width: 100%;">
                <input type="number" class="input ratings" value="${ratings}" required>
                <i class="ri-edit-line"></i>
                <span>Ratings...</span>
            </div>
    
            <div class="input-box" style="width: 100%;">
                <select class="input fuel-type" required>
                    <option value="" disabled>Select Fuel Type</option>
                    <option value="Diesel 50" ${fuelType === 'Diesel 50' ? 'selected' : ''}>Diesel 50</option>
                    <option value="Unleaded 93" ${fuelType === 'Unleaded 93' ? 'selected' : ''}>Unleaded 93</option>
                    <option value="Diesel 500" ${fuelType === 'Diesel 500' ? 'selected' : ''}>Diesel 500</option>
                    <option value="Unleaded 95" ${fuelType === 'Unleaded 95' ? 'selected' : ''}>Unleaded 95</option>
                </select>
                <i class="ri-edit-line"></i>
                <span>Fuel Type . . .</span>
            </div>
        `;
        editDetails.style.display = 'none';
        saveDetails.style.display = 'flex';
    });    

    saveDetails.addEventListener('click', async () => {
        // Retrieve updated values from the inputs
        const newExperience = details.querySelector('.input.experience').value;
        const newRatings = details.querySelector('.input.ratings').value;
        const newFuelType = details.querySelector('.input.fuel-type').value;

        const modelId = model.includes('(') 
        ? model.replace(/\s*\(.*?\)\s*/g, '').trim() 
        : model;

        console.log('model:', modelId);

        const modelCol = collection(db, "vendors", myData.id, "drivers", brand, modelId);
    
        try {
            // Retrieve documents in the collection and update them
            const modelSnap = await getDocs(modelCol);
    
            if (modelSnap.empty) {
                console.warn('No documents found in the collection.');
            }
    
            const updatePromises = modelSnap.docs.map((docSnapshot) => {
                const driverDoc = doc(modelCol, docSnapshot.id);
    
                const updateData = {
                    experience: newExperience,
                    ratings: newRatings,
                    fuelType: newFuelType
                };
    
                return updateDoc(driverDoc, updateData).then(() => {
                    console.log(`Successfully updated document with ID: ${docSnapshot.id}`);
                }).catch((error) => {
                    console.error(`Error updating document with ID: ${docSnapshot.id}`, error);
                    alert(`Failed to update document with ID: ${docSnapshot.id}. Please check the console for more details.`);
                });
            });
    
            // Wait for all updates to complete
            await Promise.all(updatePromises);
        
            // Update the details section with the new values
            details.innerHTML = `
                <h1 class="name">${brand} ${model}</h1>
                <h3 class="type">${type}</h3>
                <h5 class="experience"><b>Experience:</b> ${newExperience}</h5>
                <h5 class="licenses"><b>Licenses:</b> ${licenses}</h5>
                <h5 class="ratings"><b>Ratings:</b> ${newRatings}</h5>
                <h5 class="fuel-type"><b>Fuel Type:</b> ${newFuelType}</h5>
            `;
    
            // Toggle the visibility of the edit and save buttons
            saveDetails.style.display = 'none';
            editDetails.style.display = 'flex';
    
        } catch (error) {
            console.error("Error updating driver details: ", error);
            alert("There was an error saving the driver details. Please try again.");
        }
    });

    selectDriver.querySelector('.date').addEventListener('click', function() {
        this.showPicker();
    });
}


//      >>>     Helper functions


const renderDriverList = (myData, drivers, container, emptyMsg) => {
    if (drivers.length === 0) {
        container.innerHTML = `<p class="empty">${emptyMsg}</p>`;
        if (emptyMsg === "Add your first driver...") {
            container.querySelector("p").insertAdjacentHTML('afterbegin', `
                <i class="ri-add-line" id="addFleet"></i>
            `);

            container.querySelector("p").addEventListener("click", () => {
                const viewDrivers = document.querySelector("#drivers #viewDrivers");
                const activePage = document.querySelector("#drivers .page.active");
                displayAllDrivers(myData, container);

                document.querySelector("#drivers .header").classList.add("active");
                activateHTML(activePage, viewDrivers);
                window.history.pushState({ page: "drivers", action: "viewDrivers" }, '', "");
            });
        }
        return;
    }

    const fragment = document.createDocumentFragment();

    drivers.forEach((driver) => {
        const nameSurname = `${driver?.name ?? 'Name'} ${driver?.surname ?? 'Surname'}`.trim();
        const experience = driver?.experience ?? "0 years";
        const image = driver.image;

        const createdLi = document.createElement("li");
        createdLi.innerHTML = `
            <div class="img">
                <img src="${image}" alt="Driver Image">
            </div>
            <div class="details">
                <h1 class="name">${nameSurname}:</h1>
                <h3 class="experience"><b>Experience:</b> ${experience}</h3>
            </div>
            <div class="icon">
                <i class="ri-arrow-right-s-line"></i>
            </div>
        `;

        createdLi.addEventListener("click", () => {
            const activePage = document.querySelector("#drivers .page.active");
            activateHTML(activePage, selectDriver);
            window.history.pushState({ page: "home", action: "selectDriver" }, '', "");
            openDriver(currentDate, myData, driver);
        });

        fragment.appendChild(createdLi);
    });

    container.appendChild(fragment);
}

function filterDrivers(myData, drivers, activePage, searchTerm = "", selectedType = "", selectedSeats = "") {
    const filteredDrivers = drivers.filter(driver => {
        const matchesSearchTerm = driver.name.toLowerCase().includes(searchTerm) || 
                                  driver.surname.toLowerCase().includes(searchTerm);
        const matchesType = selectedType ? driver.type === selectedType : true;
        const matchesSeats = selectedSeats ? driver.seats === parseInt(selectedSeats) : true;

        return matchesSearchTerm && matchesType && matchesSeats;
    });

    // Clear the current driver display
    activePage.innerHTML = '';

    renderDriverList(myData, filteredDrivers, activePage, "No drivers found...");
}

async function addDriver(myData) {
    fadeInLoader();
    const image = document.getElementById('driverImg');
    const name = document.getElementById('driverName').value;
    const surname = document.getElementById('driverSurname').value;
    const email = document.getElementById('driverEmail').value;
    const tel = document.getElementById('driverTel').value;
    const password = document.getElementById('driverPassword').value;
    const confirmPassword = document.getElementById('driverConfirm').value;

    updateProgressBar(10);

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (!name || !surname || !email || !tel || !password || !confirmPassword) {
        alert('Fill in all fields!');
        return;
    }

    updateProgressBar(20);

    try {
        const createEmployee = httpsCallable(functions, 'createUser');
        const response = await createEmployee({
          email: email,
          password: password,
        });

        updateProgressBar(50);
        const result = response.data;
        
        if (result.success) {
            const user = result.user;
            const path = `vendors/${myData.id}/drivers/${name}${surname} (${user.uid})`;
            const driverRef = doc(db, 'vendors', myData.id, 'drivers', `${name}${surname} (${user.uid})`);

            const imgUrl = await uploadImageFromSrc(image, path);
            updateProgressBar(70);

            await setDoc(driverRef, {
                name: name,
                surname: surname,
                email: email,
                tel: tel,
                uid: user.uid,
                image: imgUrl,
                status: "Free!",
                balance: 0,
                rating: [
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            updateProgressBar(80);

            // Clear the input fields
            image.src = "Images/gallery.png";
            document.getElementById('driverName').value = '';
            document.getElementById('driverSurname').value = '';
            document.getElementById('driverEmail').value = '';
            document.getElementById('driverTel').value = '';
            document.getElementById('driverPassword').value = '';
            document.getElementById('driverConfirm').value = '';

            console.log('Account created successfully!');
            fadeOutLoader();
            window.location.reload();
        } else (error) => {
            console.error(error);
        }
    } catch (error) {
        console.error('Error creating account:', error);
    }
};

document.addEventListener("DOMContentLoaded", function() {
    const addIcon = document.querySelector("#createDriver .img i");
    const fileInput = document.getElementById("driverFile");
    const displayImage = document.getElementById("driverImg");

    addIcon.addEventListener("click", function() {
        fileInput.click();
    });

    fileInput.addEventListener("change", function(event) {
        updateImagePreview(event, displayImage);
    });
});









/* -----------------------------         Main (Vehicles)         ------------------------------------ */









const vehicleSummary = document.getElementById("vehicleSummary");
const selectVehicle = document.getElementById("selectVehicle");
const moreVehicles = document.getElementById("seeMoreVehicles");

function displayVehicles(currentDate, vehicles, myData) {
    const enRoute = document.querySelector("#vehicles #enRoute");
    const myVehicles = document.getElementById("myVehicles");

    enRoute.innerHTML = "";
    myVehicles.innerHTML = "";

    renderVehicleList(currentDate, myData, activeVehicles.slice(0, 2), enRoute, "No vehicles on the road...");
    renderVehicleList(currentDate, myData, vehicles.slice(0, 3), myVehicles, "Add your first vehicle...");
};

function displayMoreVehicles(currentDate, myData, vehicles, title, emptyMsg) {
    moreVehicles.innerHTML = `
        <div class="title">
            ${title}            
        </div>

        <ul class="content"></ul>
    `;

    renderVehicleList(currentDate, myData, vehicles, moreVehicles.querySelector(".content"), emptyMsg);

    const addBtn = moreVehicles.querySelector(".ri-add-line");

    if (addBtn) {
        addBtn.addEventListener("click", () => {
            document.querySelector("#customers .header").classList.remove("active");
            const viewVehicles = document.querySelector("#vehicles #viewVehicles");
            const activePage = document.querySelector("#vehicles .page.active");
            displayAllVehicles(myData, moreVehicles);

            activateHTML(activePage, viewVehicles);
            window.history.pushState({ page: "vehicles", action: "viewVehicles" }, '', "");
        })
    }
}

function displayAllVehicles(myData, container) {
    const viewVehicles = document.querySelector("#vehicles #viewVehicles");
    viewVehicles.innerHTML = "";

    const fragment = document.createDocumentFragment();

    // Store vehicle count by model and color
    const vehicleCountMap = {};

    allVehicles.forEach((vehicle, vehicleIndex) => { 
        const brandModel = `${vehicle?.brand ?? 'Brand'} ${vehicle?.model ?? 'Model'}`.trim();
        const fuelEfficiency = vehicle?.fuelEfficiency ?? "0";
        const image = vehicle?.images?.[0] ?? "Images/gallery.png";  
        const seats = vehicle?.seats ?? "Where To?";
        const colors = vehicle?.colors;

        const createdLi = document.createElement("li");
        createdLi.innerHTML = `
            <div class="img">
                <img src="${image}" alt="Vehicle Image">
            </div>
            <div class="details">
                <h1 class="name">${brandModel}:</h1>
                <h3 class="color"><b>Color:</b> ${colors.join(', ')}</h3>
                <h3 class="seats"><b>Seats:</b> ${seats}</h1>
                <h3 class="fuel"><b>Fuel Efficiency:</b> ${fuelEfficiency} Km/L</h3>
            </div>
            <div class="icon">
                <i class="ri-add-line"></i>
            </div>
        `;

        if (colors.length > 1) {
            createdLi.querySelector(".icon").innerHTML = `
                <i class="ri-arrow-right-s-line"></i>
            `;
        }

        createdLi.addEventListener("click", async () => {
            fadeInLoader();

            const showPopup = () => {
                fadeOutLoader();
                document.querySelector(".popUp-box").classList.add("active");
                const popUp = document.querySelector(".popUp-box .popUp");
                popUp.innerHTML = `
                    <ul class="color-list">
                    </ul>
                `;

                const colorList = popUp.querySelector(".color-list");

                colors.forEach((color, colorIndex) => {
                    const image = vehicle.images[colorIndex];
                    colorList.innerHTML += `
                        <li class="color-item" data-image-index="${colorIndex}" data-color="${color}">
                            <img src="${image}" alt="${color}">
                            <p>${color}</p>
                            <i class="ri-add-line"></i>
                        </li>`;
                });

                colorList.querySelectorAll(".color-item").forEach(item => {
                    item.addEventListener("click", async () => {
                        fadeInLoader();
                        const selectedColor = item.dataset.color;
                        const imageIndex = item.dataset.imageIndex;
                        const selectedImage = vehicle.images[imageIndex];

                        await saveVehicle(selectedColor, selectedImage);

                        popUp.innerHTML = "";
                        document.querySelector(".popUp-box").classList.remove("active");

                        console.log(`Saved vehicle with color: ${selectedColor}`);
                    });
                });
            };

            const saveVehicle = async (color, image) => {
                // Increment the index for the vehicle's color and model
                const key = `${vehicle.model}_${color}`;
                if (!vehicleCountMap[key]) {
                    vehicleCountMap[key] = 1;
                } else {
                    vehicleCountMap[key]++;
                }

                const customId = `${color}_${vehicle.model}_${vehicleCountMap[key]}`;
                createdLi.querySelector(".icon").innerHTML = `
                    <i class="ri-check-line"></i>
                `;

                const brandRef = doc(db, "vendors", myData.id, "vehicles", vehicle.brand);

                const brandDoc = await getDoc(brandRef);
                let modelsArray = [];

                if (brandDoc.exists() && brandDoc.data().models) {
                    modelsArray = brandDoc.data().models;
                }

                if (!modelsArray.includes(vehicle.model)) {
                    modelsArray.push(vehicle.model);
                }

                await setDoc(brandRef, {
                    models: modelsArray
                }, { merge: true });

                const vehicleRef = doc(db, "vendors", myData.id, "vehicles", vehicle.brand, vehicle.model, customId);

                console.log("color", color, "image", image);
                
                await setDoc(vehicleRef, {
                    uid: customId,
                    colors: [color], // Only save the selected color
                    images: [image],
                    index: vehicleCountMap[key],
                    brand: brandDoc.id,
                    model: vehicle.model,
                    type: vehicle.type,
                    seats: vehicle.seats,
                    fuelEfficiency: vehicle.fuelEfficiency,
                    fuelType: vehicle.fuelType,
                });

                fadeOutLoader();
            }

            if (colors.length === 1) {
                saveVehicle(colors[0], vehicle.images[0]);
            } else {
                showPopup();
            }
        });

        fragment.appendChild(createdLi);
    });

    viewVehicles.appendChild(fragment);
}

function openVehicle(currentDate, myData, vehicle) {
    console.log("vehicle", vehicle);

    const brand = vehicle?.brand ?? 'Brand';
    const model = vehicle?.model ?? 'Model';
    const type = vehicle?.type ?? 'Type';
    const fuelEfficiency = vehicle?.fuelEfficiency ?? "0";
    const fuelType = vehicle?.fuelType ?? "Fuel";
    const image = vehicle?.images[0] ?? "Images/gallery.png";  // Use the first image if available
    const seats = vehicle?.seats ?? "Where To?";
    const colors = vehicle?.colors;  // Use the first color if available

    const booking = vehicle?.booking || {};
    const dropOffAddresses = booking?.dropOffAddresses || [];
    const pickUpAddress = booking?.pickUpAddress || {};
    const eta = booking?.pickUpTime || "";
    const price = booking?.price || "";

    const dropOffAddressNames = dropOffAddresses.map(addr => addr.name);

    // Update the container's HTML
    selectVehicle.innerHTML = `
        <div class="top">
            <i class="ri-save-3-fill" style="display: none" id="saveDetails"></i>
            <i class='bx bxs-edit-alt' id="editDetails"></i>

            <div class="img">
                <img src="${image}" alt="Vehicle Image">
            </div>

            <div class="details">
                <h1 class="name">${brand} ${model} ${vehicle.index}</h1>
                <h3 class="type">${type}</h3>
                <h5 class="seats"><b>Seats:</b> ${seats}</h5>
                <h5 class="colors"><b>Colours:</b> ${colors}</h5>
                <h5 class="fuel-efficiency"><b>Fuel Efficiency:</b> ${fuelEfficiency} Km/L</h5>
                <h5 class="fuel-type"><b>Fuel Type:</b> ${fuelType}</h5>
            </div>
        </div>

        <div class="input-box" style="width: 300px;">
            <input type="date" class="date" name="vehicleDate" id="vehicleDate" required>
            <i class="ri-calendar-todo-fill"></i>
            <span>Select Date...</span>
        </div>

        <ul class="bottom">
            <li>

            </li>
        </ul>
    `;

    const editDetails = selectVehicle.querySelector('#editDetails');
    const saveDetails = selectVehicle.querySelector('#saveDetails');
    const details = selectVehicle.querySelector('.details');

    editDetails.addEventListener('click', () => {
        details.innerHTML = `
            <h1 class="name">${brand} ${model}</h1>
            <h3 class="type">${type}</h3>
    
            <div class="input-box" style="width: 100%;">
                <input type="text" class="input seats" value="${seats}" required>
                <i class="ri-edit-line"></i>
                <span>Seats...</span>
            </div>
    
            <div class="input-box" style="width: 100%;">
                <input type="number" class="input fuel-efficiency" value="${fuelEfficiency}" required>
                <i class="ri-edit-line"></i>
                <span>Fuel Efficiency...</span>
            </div>
    
            <div class="input-box" style="width: 100%;">
                <select class="input fuel-type" required>
                    <option value="" disabled>Select Fuel Type</option>
                    <option value="Diesel 50" ${fuelType === 'Diesel 50' ? 'selected' : ''}>Diesel 50</option>
                    <option value="Unleaded 93" ${fuelType === 'Unleaded 93' ? 'selected' : ''}>Unleaded 93</option>
                    <option value="Diesel 500" ${fuelType === 'Diesel 500' ? 'selected' : ''}>Diesel 500</option>
                    <option value="Unleaded 95" ${fuelType === 'Unleaded 95' ? 'selected' : ''}>Unleaded 95</option>
                </select>
                <i class="ri-edit-line"></i>
                <span>Fuel Type . . .</span>
            </div>
        `;
        editDetails.style.display = 'none';
        saveDetails.style.display = 'flex';
    });    

    saveDetails.addEventListener('click', async () => {
        // Retrieve updated values from the inputs
        const newSeats = details.querySelector('.input.seats').value;
        const newFuelEfficiency = details.querySelector('.input.fuel-efficiency').value;
        const newFuelType = details.querySelector('.input.fuel-type').value;

        const modelId = model.includes('(') 
        ? model.replace(/\s*\(.*?\)\s*/g, '').trim() 
        : model;

        console.log('model:', modelId);

        const modelCol = collection(db, "vendors", myData.id, "vehicles", brand, modelId);
    
        try {
            // Retrieve documents in the collection and update them
            const modelSnap = await getDocs(modelCol);
    
            if (modelSnap.empty) {
                console.warn('No documents found in the collection.');
            }
    
            const updatePromises = modelSnap.docs.map((docSnapshot) => {
                const vehicleDoc = doc(modelCol, docSnapshot.id);
    
                const updateData = {
                    seats: newSeats,
                    fuelEfficiency: newFuelEfficiency,
                    fuelType: newFuelType
                };
    
                return updateDoc(vehicleDoc, updateData).then(() => {
                    console.log(`Successfully updated document with ID: ${docSnapshot.id}`);
                }).catch((error) => {
                    console.error(`Error updating document with ID: ${docSnapshot.id}`, error);
                    alert(`Failed to update document with ID: ${docSnapshot.id}. Please check the console for more details.`);
                });
            });
    
            // Wait for all updates to complete
            await Promise.all(updatePromises);
        
            // Update the details section with the new values
            details.innerHTML = `
                <h1 class="name">${brand} ${model}</h1>
                <h3 class="type">${type}</h3>
                <h5 class="seats"><b>Seats:</b> ${newSeats}</h5>
                <h5 class="colors"><b>Colours:</b> ${colors}</h5>
                <h5 class="fuel-efficiency"><b>Fuel Efficiency:</b> ${newFuelEfficiency} Km/L</h5>
                <h5 class="fuel-type"><b>Fuel Type:</b> ${newFuelType}</h5>
            `;
    
            // Toggle the visibility of the edit and save buttons
            saveDetails.style.display = 'none';
            editDetails.style.display = 'flex';
    
        } catch (error) {
            console.error("Error updating vehicle details: ", error);
            alert("There was an error saving the vehicle details. Please try again.");
        }
    });

    selectVehicle.querySelector('.date').addEventListener('click', function() {
        this.showPicker();
    });

    /*const bookingsContainer = selectVehicle.querySelector(".bottom");

    // Helper function to create address list items
    const addBookingItem = (icon, title, address) => {
        bookingsContainer.insertAdjacentHTML('beforeend', `
            <li class="address-box">
                <div class="address">
                    <span>${title}:</span>
                    <p>${address}</p>
                </div>
                <div class="icon"><i class="${icon}"></i></div>
            </li>
        `);
    };

    // Populate pick-up and drop-off addresses
    if (!vehicle.bookings) {
        bookingsContainer.innerHTML = "<p>No Bookings for this Date...</p>";
    } else {
        vehicle.bookings.forEach((name, index) => {
            const title = index === dropOffAddressNames.length - 1 ? "Drop Off" : `Stop ${index + 1}`;
            addAddressItem("ri-pin-distance-fill", title, name);
        });
    }*/
}


//      >>>     Helper functions


const renderVehicleList = (currentDate, myData, vehicles, container, emptyMsg) => {
    if (vehicles.length === 0) {
        container.innerHTML = `<p class="empty">${emptyMsg}</p>`;
        if (emptyMsg === "Add your first vehicle...") {
            container.querySelector("p").insertAdjacentHTML('afterbegin', `
                <i class="ri-add-line" id="addFleet"></i>
            `);

            container.querySelector("p").addEventListener("click", () => {
                const viewVehicles = document.querySelector("#vehicles #viewVehicles");
                const activePage = document.querySelector("#vehicles .page.active");
                displayAllVehicles(myData, container);

                document.querySelector("#vehicles .header").classList.add("active");
                activateHTML(activePage, viewVehicles);
                window.history.pushState({ page: "vehicles", action: "viewVehicles" }, '', "");
            })
        }
        return;
    }

    const fragment = document.createDocumentFragment();

    vehicles.forEach((vehicle) => {
        const brandModel = `${vehicle?.brand ?? 'Brand'} ${vehicle?.model ?? 'Model'}`.trim();
        const fuelEfficiency = vehicle?.fuelEfficiency ?? "0";
        const image = vehicle.images[0];
        const seats = vehicle.seats;
        const color = vehicle.colors[0];

        const createdLi = document.createElement("li");
        createdLi.innerHTML = `
            <div class="img">
                <img src="${image}" alt="Vehicle Image">
            </div>
            <div class="details">
                <h1 class="name">${brandModel} ${vehicle.index}:</h1>
                <h3 class="color"><b>Color:</b> ${color}</h3>
                <h3 class="seats"><b>Seats:</b> ${seats}</h1>
                <h3 class="fuel"><b>Fuel Efficiency:</b> ${fuelEfficiency} Km/L</h3>
            </div>
            <div class="icon">
                <i class="ri-arrow-right-s-line"></i>
            </div>
        `;

        if (vehicle.colors.length === 1 && container.getAttribute('id') !== "myVehicles") {
            createdLi.querySelector(".icon").innerHTML = `<i class="ri-add-line"></i>`;
        }

        createdLi.addEventListener("click", () => {
            const activePage = document.querySelector("#vehicles .page.active");
            activateHTML(activePage, selectVehicle);
            window.history.pushState({ page: "home", action: "selectVehicle" }, '', "");
            openVehicle(currentDate, myData, vehicle);
        });

        fragment.appendChild(createdLi);
    });

    container.appendChild(fragment);
}

function filterVehicles(myData, vehicles, activePage, searchTerm = "", selectedType = "", selectedSeats = "") {
    const filteredVehicles = vehicles.filter(vehicle => {
        const matchesSearchTerm = vehicle.brand.toLowerCase().includes(searchTerm) || 
                                  vehicle.model.toLowerCase().includes(searchTerm);
        const matchesType = selectedType ? vehicle.type === selectedType : true;
        const matchesSeats = selectedSeats ? vehicle.seats === parseInt(selectedSeats) : true;

        return matchesSearchTerm && matchesType && matchesSeats;
    });

    // Clear the current vehicle display
    activePage.innerHTML = '';

    renderVehicleList(myData, filteredVehicles, activePage, "No vehicles found...");
}









/* -----------------------------         Main (Customers)         ------------------------------------ */









const customerSummary = document.getElementById("customerSummary");
const selectCustomer = document.getElementById("selectCustomer");
const moreCustomers = document.getElementById("seeMoreCustomers");

function displayCustomers(currentDate, customers, myData) {
    const enRoute = document.querySelector("#customerSummary #enRoute");
    const myCustomers = document.getElementById("myCustomers");

    enRoute.innerHTML = "";
    myCustomers.innerHTML = "";

    renderCustomerList(myData, activeUsers.slice(0, 2), enRoute, "No customers on the road...");
    renderCustomerList(myData, customers.slice(0, 3), myCustomers, "Add your first customer...");
};

function displayMoreCustomers(currentDate, myData, customers, title, emptyMsg) {
    moreCustomers.innerHTML = `
        <div class="title">
            ${title}            
        </div>

        <ul class="content"></ul>
    `;

    renderCustomerList(myData, customers, moreCustomers.querySelector(".content"), emptyMsg);

    const addBtn = moreCustomers.querySelector(".ri-add-line");

    if (addBtn) {
        addBtn.addEventListener("click", () => {
            document.querySelector("#customers .header").classList.remove("active");
            const createCustomer = document.querySelector("#customers #createCustomer");
            const activePage = document.querySelector("#customers .page.active");

            activateHTML(activePage, createCustomer);
            window.history.pushState({ page: "customers", action: "addCustomer" }, '', "");

            document.getElementById("addCustomer").addEventListener("click", () => {
                addCustomer(myData);
            })
        })
    }
}

function displayAllCustomers(myData, container) {
    const viewCustomers = document.querySelector("#customers #viewCustomers");
    viewCustomers.innerHTML = "";

    const fragment = document.createDocumentFragment();

    // Store customer count by model and color
    const customerCountMap = {};

    allCustomers.forEach((customer, customerIndex) => { 
        const brandModel = `${customer?.brand ?? 'Brand'} ${customer?.model ?? 'Model'}`.trim();
        const fuelEfficiency = customer?.fuelEfficiency ?? "0";
        const image = customer?.images?.[0] ?? "Images/gallery.png";  
        const seats = customer?.seats ?? "Where To?";
        const colors = customer?.colors;

        const createdLi = document.createElement("li");
        createdLi.innerHTML = `
            <div class="img">
                <img src="${image}" alt="Customer Image">
            </div>
            <div class="details">
                <h1 class="name">${brandModel}:</h1>
                <h3 class="color"><b>Color:</b> ${colors.join(', ')}</h3>
                <h3 class="seats"><b>Seats:</b> ${seats}</h1>
                <h3 class="fuel"><b>Fuel Efficiency:</b> ${fuelEfficiency} Km/L</h3>
            </div>
            <div class="icon">
                <i class="ri-add-line"></i>
            </div>
        `;

        if (colors.length > 1) {
            createdLi.querySelector(".icon").innerHTML = `
                <i class="ri-arrow-right-s-line"></i>
            `;
        }

        createdLi.addEventListener("click", async () => {
            fadeInLoader();

            const showPopup = () => {
                fadeOutLoader();
                document.querySelector(".popUp-box").classList.add("active");
                const popUp = document.querySelector(".popUp-box .popUp");
                popUp.innerHTML = `
                    <ul class="color-list">
                    </ul>
                `;

                const colorList = popUp.querySelector(".color-list");

                colors.forEach((color, colorIndex) => {
                    const image = customer.images[colorIndex];
                    colorList.innerHTML += `
                        <li class="color-item" data-image-index="${colorIndex}" data-color="${color}">
                            <img src="${image}" alt="${color}">
                            <p>${color}</p>
                            <i class="ri-add-line"></i>
                        </li>`;
                });

                colorList.querySelectorAll(".color-item").forEach(item => {
                    item.addEventListener("click", async () => {
                        fadeInLoader();
                        const selectedColor = item.dataset.color;
                        const imageIndex = item.dataset.imageIndex;
                        const selectedImage = customer.images[imageIndex];

                        await saveCustomer(selectedColor, selectedImage);

                        popUp.innerHTML = "";
                        document.querySelector(".popUp-box").classList.remove("active");

                        console.log(`Saved customer with color: ${selectedColor}`);
                    });
                });
            };

            const saveCustomer = async (color, image) => {
                // Increment the index for the customer's color and model
                const key = `${customer.model}_${color}`;
                if (!customerCountMap[key]) {
                    customerCountMap[key] = 1;
                } else {
                    customerCountMap[key]++;
                }

                const customId = `${color}_${customer.model}_${customerCountMap[key]}`;
                createdLi.querySelector(".icon").innerHTML = `
                    <i class="ri-check-line"></i>
                `;

                const brandRef = doc(db, "vendors", myData.id, "customers", customer.brand);

                const brandDoc = await getDoc(brandRef);
                let modelsArray = [];

                if (brandDoc.exists() && brandDoc.data().models) {
                    modelsArray = brandDoc.data().models;
                }

                if (!modelsArray.includes(customer.model)) {
                    modelsArray.push(customer.model);
                }

                await setDoc(brandRef, {
                    models: modelsArray
                }, { merge: true });

                const customerRef = doc(db, "vendors", myData.id, "customers", customer.brand, customer.model, customId);

                console.log("color", color, "image", image);
                
                await setDoc(customerRef, {
                    uid: customId,
                    colors: [color], // Only save the selected color
                    images: [image],
                    index: customerCountMap[key],
                    brand: brandDoc.id,
                    model: customer.model,
                    type: customer.type,
                    seats: customer.seats,
                    fuelEfficiency: customer.fuelEfficiency,
                    fuelType: customer.fuelType,
                });

                fadeOutLoader();
            }

            if (colors.length === 1) {
                saveCustomer(colors[0], customer.images[0]);
            } else {
                showPopup();
            }
        });

        fragment.appendChild(createdLi);
    });

    viewCustomers.appendChild(fragment);
}

function openCustomer(myData, customer) {
    console.log("customer", customer);

    const name = customer?.name ?? 'Name';
    const surname = customer?.surname ?? 'Surname';
    const image = customer?.images[0] ?? "Images/gallery.png";
    const booking = customer?.booking || {};
    const dropOffAddresses = booking?.dropOffAddresses || [];
    const pickUpAddress = booking?.pickUpAddress || {};
    const eta = booking?.pickUpTime || "";
    const price = booking?.price || "";

    const dropOffAddressNames = dropOffAddresses.map(addr => addr.name);

    // Update the container's HTML
    selectCustomer.innerHTML = `
        <div class="top">
            <i class="ri-save-3-fill" style="display: none" id="saveDetails"></i>
            <i class='bx bxs-edit-alt' id="editDetails"></i>

            <div class="img">
                <img src="${image}" alt="Customer Image">
            </div>

            <div class="details">
                <h1 class="name">${brand} ${model} ${customer.index}</h1>
                <h3 class="type">${type}</h3>
                <h5 class="seats"><b>Seats:</b> ${seats}</h5>
                <h5 class="colors"><b>Colours:</b> ${colors}</h5>
                <h5 class="fuel-efficiency"><b>Fuel Efficiency:</b> ${fuelEfficiency} Km/L</h5>
                <h5 class="fuel-type"><b>Fuel Type:</b> ${fuelType}</h5>
            </div>
        </div>

        <div class="input-box" style="width: 300px;">
            <input type="date" class="date" name="customerDate" id="customerDate" required>
            <i class="ri-calendar-todo-fill"></i>
            <span>Select Date...</span>
        </div>

        <ul class="bottom">
            <li>

            </li>
        </ul>
    `;

    const editDetails = selectCustomer.querySelector('#editDetails');
    const saveDetails = selectCustomer.querySelector('#saveDetails');
    const details = selectCustomer.querySelector('.details');

    editDetails.addEventListener('click', () => {
        details.innerHTML = `
            <h1 class="name">${brand} ${model}</h1>
            <h3 class="type">${type}</h3>
    
            <div class="input-box" style="width: 100%;">
                <input type="text" class="input seats" value="${seats}" required>
                <i class="ri-edit-line"></i>
                <span>Seats...</span>
            </div>
    
            <div class="input-box" style="width: 100%;">
                <input type="number" class="input fuel-efficiency" value="${fuelEfficiency}" required>
                <i class="ri-edit-line"></i>
                <span>Fuel Efficiency...</span>
            </div>
    
            <div class="input-box" style="width: 100%;">
                <select class="input fuel-type" required>
                    <option value="" disabled>Select Fuel Type</option>
                    <option value="Diesel 50" ${fuelType === 'Diesel 50' ? 'selected' : ''}>Diesel 50</option>
                    <option value="Unleaded 93" ${fuelType === 'Unleaded 93' ? 'selected' : ''}>Unleaded 93</option>
                    <option value="Diesel 500" ${fuelType === 'Diesel 500' ? 'selected' : ''}>Diesel 500</option>
                    <option value="Unleaded 95" ${fuelType === 'Unleaded 95' ? 'selected' : ''}>Unleaded 95</option>
                </select>
                <i class="ri-edit-line"></i>
                <span>Fuel Type . . .</span>
            </div>
        `;
        editDetails.style.display = 'none';
        saveDetails.style.display = 'flex';
    });    

    saveDetails.addEventListener('click', async () => {
        // Retrieve updated values from the inputs
        const newSeats = details.querySelector('.input.seats').value;
        const newFuelEfficiency = details.querySelector('.input.fuel-efficiency').value;
        const newFuelType = details.querySelector('.input.fuel-type').value;

        const modelId = model.includes('(') 
        ? model.replace(/\s*\(.*?\)\s*/g, '').trim() 
        : model;

        console.log('model:', modelId);

        const modelCol = collection(db, "vendors", myData.id, "customers", brand, modelId);
    
        try {
            // Retrieve documents in the collection and update them
            const modelSnap = await getDocs(modelCol);
    
            if (modelSnap.empty) {
                console.warn('No documents found in the collection.');
            }
    
            const updatePromises = modelSnap.docs.map((docSnapshot) => {
                const customerDoc = doc(modelCol, docSnapshot.id);
    
                const updateData = {
                    seats: newSeats,
                    fuelEfficiency: newFuelEfficiency,
                    fuelType: newFuelType
                };
    
                return updateDoc(customerDoc, updateData).then(() => {
                    console.log(`Successfully updated document with ID: ${docSnapshot.id}`);
                }).catch((error) => {
                    console.error(`Error updating document with ID: ${docSnapshot.id}`, error);
                    alert(`Failed to update document with ID: ${docSnapshot.id}. Please check the console for more details.`);
                });
            });
    
            // Wait for all updates to complete
            await Promise.all(updatePromises);
        
            // Update the details section with the new values
            details.innerHTML = `
                <h1 class="name">${brand} ${model}</h1>
                <h3 class="type">${type}</h3>
                <h5 class="seats"><b>Seats:</b> ${newSeats}</h5>
                <h5 class="colors"><b>Colours:</b> ${colors}</h5>
                <h5 class="fuel-efficiency"><b>Fuel Efficiency:</b> ${newFuelEfficiency} Km/L</h5>
                <h5 class="fuel-type"><b>Fuel Type:</b> ${newFuelType}</h5>
            `;
    
            // Toggle the visibility of the edit and save buttons
            saveDetails.style.display = 'none';
            editDetails.style.display = 'flex';
    
        } catch (error) {
            console.error("Error updating customer details: ", error);
            alert("There was an error saving the customer details. Please try again.");
        }
    });

    selectCustomer.querySelector('.date').addEventListener('click', function() {
        this.showPicker();
    });

    /*const bookingsContainer = selectCustomer.querySelector(".bottom");

    // Helper function to create address list items
    const addBookingItem = (icon, title, address) => {
        bookingsContainer.insertAdjacentHTML('beforeend', `
            <li class="address-box">
                <div class="address">
                    <span>${title}:</span>
                    <p>${address}</p>
                </div>
                <div class="icon"><i class="${icon}"></i></div>
            </li>
        `);
    };

    // Populate pick-up and drop-off addresses
    if (!customer.bookings) {
        bookingsContainer.innerHTML = "<p>No Bookings for this Date...</p>";
    } else {
        customer.bookings.forEach((name, index) => {
            const title = index === dropOffAddressNames.length - 1 ? "Drop Off" : `Stop ${index + 1}`;
            addAddressItem("ri-pin-distance-fill", title, name);
        });
    }*/
}


//      >>>     Helper functions


const renderCustomerList = (myData, customers, container, emptyMsg) => {
    if (customers.length === 0) {
        container.innerHTML = `<p class="empty">${emptyMsg}</p>`;
        if (emptyMsg === "Add your first customer...") {
            container.querySelector("p").insertAdjacentHTML('afterbegin', `
                <i class="ri-add-line" id="addFleet"></i>
            `);

            container.querySelector("p").addEventListener("click", () => {
                const viewCustomers = document.querySelector("#customers #viewCustomers");
                const activePage = document.querySelector("#customers .page.active");
                displayAllCustomers(myData, container);

                document.querySelector("#customers .header").classList.add("active");
                activateHTML(activePage, viewCustomers);
                window.history.pushState({ page: "customers", action: "viewCustomers" }, '', "");
            });
        }
        return;
    }

    const fragment = document.createDocumentFragment();

    customers.forEach((customer) => {
        const nameSurname = `${customer?.name ?? 'Name'} ${customer?.surname ?? 'Surname'}`.trim();
        const age = customer?.age ?? "0 years";
        const image = customer.image || "Images/gallery.png";
        //const seats = customer.seats;
        //const license = customer.licenses[0];

        const createdLi = document.createElement("li");
        createdLi.innerHTML = `
            <div class="img">
                <img src="${image}" alt="Customer Image">
            </div>
            <div class="details">
                <h1 class="name">${nameSurname}:</h1>
                <h3 class="age"><b>Age:</b> ${age}</h3>
            </div>
            <div class="icon">
                <i class="ri-arrow-right-s-line"></i>
            </div>
        `;

        createdLi.addEventListener("click", () => {
            const activePage = document.querySelector("#customers .page.active");
            activateHTML(activePage, selectCustomer);
            window.history.pushState({ page: "home", action: "selectCustomer" }, '', "");
            openCustomer(myData, customer);
        });

        fragment.appendChild(createdLi);
    });

    container.appendChild(fragment);
}

function filterCustomers(myData, customers, activePage, searchTerm = "", selectedType = "", selectedSeats = "") {
    const filteredCustomers = customers.filter(customer => {
        const matchesSearchTerm = customer.name.toLowerCase().includes(searchTerm) || 
                                  customer.surname.toLowerCase().includes(searchTerm);
        //const matchesType = selectedType ? customer.type === selectedType : true;
        //const matchesSeats = selectedSeats ? customer.seats === parseInt(selectedSeats) : true;

        return matchesSearchTerm;// && matchesType && matchesSeats;
    });

    // Clear the current customer display
    activePage.innerHTML = '';

    renderCustomerList(myData, filteredCustomers, activePage, "No customers found...");
}

async function addCustomer(myData) {
    fadeInLoader();
    const image = document.getElementById('customerImg');
    const name = document.getElementById('customerName').value.trim();
    const surname = document.getElementById('customerSurname').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const tel = document.getElementById('customerTel').value.trim();
    const password = document.getElementById('customerPassword').value.trim();
    const confirmPassword = document.getElementById('customerConfirm').value.trim();

    updateProgressBar(10);

    if (!name || !surname || !email || !tel || !password || !confirmPassword) {
        alert('Please fill in all fields!');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    updateProgressBar(20);

    try {
        const createEmployee = httpsCallable(functions, 'createUser');
        const response = await createEmployee({ email, password });
        const { success, user } = response.data;

        updateProgressBar(40);

        if (success) {
            const customerRef = doc(db, 'users', `${name}${surname} (${user.uid})`);
            const path = `users/${name}${surname} (${user.uid})`;
            const driverRef = doc(db, 'users', `${name}${surname} (${user.uid})`);

            const imgUrl = await uploadImageFromSrc(image, path);
            updateProgressBar(60);

            await setDoc(customerRef, {
                name,
                surname,
                email,
                tel,
                uid: user.uid,
                image: imgUrl,
                status: "None",
                gender: "Gender",
                address: "Address...",
                vendor: myData.uid,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            updateProgressBar(80);

            image.src = "Images/gallery.png";
            document.getElementById('customerName').value = '';
            document.getElementById('customerSurname').value = '';
            document.getElementById('customerEmail').value = '';
            document.getElementById('customerTel').value = '';
            document.getElementById('customerPassword').value = '';
            document.getElementById('customerConfirm').value = '';

            console.log('Account created successfully!');
            fadeOutLoader();
            window.location.reload();
        } else {
            throw new Error('Account creation failed');
        }
    } catch (error) {
        console.error('Error creating account:', error);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const addIcon = document.querySelector("#createCustomer .img i");
    const fileInput = document.getElementById("customerFile");
    const displayImage = document.getElementById("customerImg");

    addIcon.addEventListener("click", function() {
        fileInput.click();
    });

    fileInput.addEventListener("change", function(event) {
        updateImagePreview(event, displayImage);
    });
});








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
    document.querySelector("#home .header h3").textContent = `${myData.name}`;

    const header = document.querySelector(".body #profileMenu .top");
    const pfp = myData.image || "Images/gallery.png";

    header.innerHTML = `
        <div class="img">
            <img src=${pfp} alt="Profile Picture">
        </div>

        <h1>${myData.name}</h1>
        <h5>${myData.type} Transport</h5>
    `;
}









/* -----------------------------         Footer         ------------------------------------ */









function mainNavigation() {
    const navItems = document.querySelectorAll(".side-nav li");
    const menuItem = document.querySelector("#menuItem");
    const sections = document.querySelectorAll("main section");
    const pageNames = ["home", "drivers", "customers", "vehicles", "menu"];

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

const deactivateAllSections = () => {
    menuItem.classList.remove("active");
    navItems.forEach(item => item.classList.remove("active"));
};

// Function to activate a specific navigation item and section by index
const activateSection = index => {
    navItems[index]?.classList.add("active");
    activateHTML(document.querySelector("section.active"), sections[index])
};