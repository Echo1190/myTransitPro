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
    doc, getDoc, onSnapshot, deleteDoc, addDoc, collectionGroup, orderBy,
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
const storage = getStorage(app);
const messaging = getMessaging(app);
const functions = getFunctions(app, 'us-central1');

document.addEventListener('DOMContentLoaded', function() {
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









/* -----------------------------         Header         ------------------------------------ */



















/* -----------------------------         Main (Home)         ------------------------------------ */









let vehicles;

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
                { func: () => getMyData(user), name: "getMyData" },
                { func: () => getVehicles(), name: "getVehicles" },
                { func: () => getVendorData(user), name: "getVendorData" },
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

                updateProgressBar(90)


                // ====================>   Get data   


                const myData = results[0];
                vehicles = results[1];


                // ====================>   Initial Functions   


                //  >>> Main (Home)


                try {
                    displayVehicles(currentDate, vehicles.slice(0, 3), myData);
                } catch (error) {
                    console.error(`Error in displayVehicles:`, error);
                }
                

                //  >>> Main (Drivers)





                //  >>> Main (Vehicles)





                //  >>> Main (Customers)





                //  >>> Main (Menu)




                // ====================>   Event Listeners   


                //  >>> Main (Home)



                //  >>> Main (Drivers)



                //  >>> Main (Customers)



                //  >>> Main (Vehicles)

                document.getElementById("searchVehicle").addEventListener("input", handleSearch);
                document.getElementById("searchVehicleType").addEventListener("change", handleSearch);
                document.getElementById("searchVehicleSeats").addEventListener("change", handleSearch);
                
                function handleSearch() {
                    const searchTerm = document.getElementById("searchVehicle").value.toLowerCase();
                    const selectedType = document.getElementById("searchVehicleType").value;
                    const selectedSeats = document.getElementById("searchVehicleSeats").value;
                
                    filterVehicles(currentDate, myData, vehicles, searchTerm, selectedType, selectedSeats);
                }

                document.querySelector("#moreVehicles").addEventListener("click", () => {
                    try {
                        activateHTML(vehicleSummary, seeMore);
                        window.history.pushState({ page: "vehicles", action: "seeMore" }, '', "");

                        document.querySelector("#vehicles .header").classList.add("active");

                        displayMoreVehicles(currentDate, myData, vehicles);
                    } catch (error) {
                        console.error(`Error in displayMoreVehicles:`, error);
                    }
                })

                document.getElementById("addVehicle").addEventListener("click", () => {
                    saveVehicle(currentDate, myData);
                });

                //  >>> Main (Menu)



                //  >>> History Popstate

                window.addEventListener("popstate", event => {
                    const state = event.state;
                    const { page, action } = state;
                    console.log('Page:', page);
                    console.log('Action:', action);

                    // Deactivate all navigation items and sections before activating the new one
                    deactivateAllSections();

                    switch (page) {
                        case "home":
                            console.log("Home Page");
                            activateSection(0);
                

                            break;
                        case "drivers":
                            console.log("Drivers page");
                            activateSection(1);
                            

                            break;

                        case "customers":
                            console.log("Customers Page");
                            activateSection(2);

                            

                            break;
                        case "vehicles":
                            console.log("Vehicles Page");
                            activateSection(3);

                            
                            const activePage = document.querySelector("#vehicles .page.active");
                            document.querySelector("#vehicles .header").classList.remove("active");
                            document.querySelector(".popUp-box").classList.remove("active");
                
                            switch (action) {
                                case "default":
                                    activateHTML(activePage, vehicleSummary);
                                    break;
                                case "seeMore":
                                    document.querySelector("#vehicles .header").classList.add("active");
                                    activateHTML(activePage, seeMore);
                                    break;
                                case "selectVehicle":
                                    activateHTML(activePage, selectVehicle);
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
    handleSignUpForm();
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

async function getMyData(user) {
    const adminCollectionRef = collection(db, 'admin');
    const adminQuery = query(adminCollectionRef, where("uid", "==", user.uid));
    const adminsSnapshot = await getDocs(adminQuery);

    if (adminsSnapshot.empty) {
        return null; // Return null if no admin is found
    }

    const adminDoc = adminsSnapshot.docs[0];
    const admin = {
        id: adminDoc.id,
        ...adminDoc.data()
    };

    updateProgressBar(30)

    return admin;
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

        updateProgressBar(50)

        // Process all model snapshots concurrently
        await Promise.all(fetchModelPromises);

        const vehicles = Array.from(vehiclesMap.values());
        console.log("vehicles", vehicles);

        return vehicles;
    } catch (error) {
        console.error('Error fetching vehicles:', error);
    }
}

async function getVendorData(user) {
    const vendorCollectionRef = collection(db, 'vendors');
    const vendorQuery = query(vendorCollectionRef, where("uid", "==", user.uid));
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

    updateProgressBar(50)

    return {
        ...vendor,
        vehicles,
        drivers: driversWithAverageRating
    };
}

function updateImagePreview(event, img, box) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        box.classList.remove("inactive");
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

async function useLocalImagePath(imgElement, brand, model) {
    const fileInput = document.getElementById('vehicleFile'); // Replace with your file input ID

    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0]; // Get the selected file
        let imageName = file.name; // Get the file name as it is

        // Construct the full path using the brand, model, and image name
        const fullPath = `Vehicles/${brand}/${model}/${imageName}`;

        console.log('Using local image path:', fullPath);

        return fullPath; // Return the constructed local path
    } else {
        console.error('No file selected or file input element not found.');
        return null;
    }
}









/* -----------------------------         Authentication         ------------------------------------ */









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









/* -----------------------------         Main (Drivers)         ------------------------------------ */



















/* -----------------------------         Main (Vehicles)         ------------------------------------ */









const vehicleSummary = document.getElementById("vehicleSummary");
const selectVehicle = document.getElementById("selectVehicle");
const seeMore = document.getElementById("seeMore");

function displayVehicles(currentDate, vehicles, myData) {
    const myVehicles = document.getElementById("myVehicles");

    myVehicles.innerHTML = "";

    if (vehicles.length === 0) {
        myVehicles.innerHTML = `<p class="empty">Add your first vehicle...</p>`;
        return;
    }

    const fragment = document.createDocumentFragment();

    vehicles.forEach((vehicle) => {
        const brandModel = `${vehicle?.brand ?? 'Brand'} ${vehicle?.model ?? 'Model'}`.trim();
        const fuelEfficiency = vehicle?.fuelEfficiency ?? "0";
        const fuelType = vehicle?.fuelType ?? "Fuel";
        const image = vehicle?.images?.[0] ?? "Images/gallery.png";  // Use the first image if available
        const seats = vehicle?.seats ?? "Where To?";
        const color = vehicle?.colors;

        const createdLi = document.createElement("li");
        createdLi.innerHTML = `
            <div class="img">
                <img src="${image}" alt="Vehicle Image">
            </div>
            <div class="details">
                <h1 class="name">${brandModel}:</h1>
                <h3 class="color"><b>Color:</b> ${color}</h3>
                <h3 class="seats"><b>Seats:</b> ${seats}</h1>
                <h3 class="fuel"><b>Fuel Efficiency:</b> ${fuelEfficiency} Km/L</h3>
                <h3 class="fuel-type"><b>Fuel Type:</b> ${fuelType}</h3>
            </div>
            <i class="ri-arrow-right-s-line"></i>
        `;

        if (vehicle.status === "Pending...") {
            createdLi.classList.add("inactive");
        }

        createdLi.addEventListener("click", () => {
            activateHTML(vehicleSummary, selectVehicle);
            window.history.pushState({ page: "vehicles", action: "selectVehicle" }, '', "");
            openVehicle(currentDate, myData, vehicle);
        });

        fragment.appendChild(createdLi);
    });

    myVehicles.appendChild(fragment);
};

function displayMoreVehicles(currentDate, myData, vehicles) {
    seeMore.innerHTML = `
        <div class="title">
            <h1>Vehicle List:</h1>
        </div>

        <ul class="content">

        </ul>
    `;

    if (vehicles.length === 0) {
        seeMore.innerHTML = `<p class="empty">No vehicles found...</p>`;
        return;
    }

    const fragment = document.createDocumentFragment();

    vehicles.forEach((vehicle) => {
        const brandModel = `${vehicle?.brand ?? 'Brand'} ${vehicle?.model ?? 'Model'}`.trim();
        const fuelEfficiency = vehicle?.fuelEfficiency ?? "0";
        const fuelType = vehicle?.fuelType ?? "Fuel";
        const image = vehicle?.images?.[0] ?? "Images/gallery.png";  // Use the first image if available
        const seats = vehicle?.seats ?? "Where To?";
        const color = vehicle?.colors;  // Use the first color if available

        const createdLi = document.createElement("li");
        createdLi.innerHTML = `
            <div class="img">
                <img src="${image}" alt="Vehicle Image">
            </div>
            <div class="details">
                <h1 class="name">${brandModel}:</h1>
                <h3 class="color"><b>Color:</b> ${color}</h3>
                <h3 class="seats"><b>Seats:</b> ${seats}</h1>
                <h3 class="fuel"><b>Fuel Efficiency:</b> ${fuelEfficiency} Km/L</h3>
                <h3 class="fuel-type"><b>Fuel Type:</b> ${fuelType}</h3>
            </div>
            <i class="ri-arrow-right-s-line"></i>
        `;

        if (vehicle.status === "Pending...") {
            createdLi.classList.add("inactive");
        }

        createdLi.addEventListener("click", () => {
            document.querySelector("#vehicles .header").classList.remove("active");
            activateHTML(seeMore, selectVehicle);
            window.history.pushState({ page: "vehicles", action: "selectVehicle" }, '', "");
            openVehicle(currentDate, myData, vehicle);
        });

        fragment.appendChild(createdLi);
    });

    seeMore.querySelector(".content").appendChild(fragment);
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
                <h1 class="name">${brand} ${model}</h1>
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

        const modelCol = collection(db, 'vehicles', brand, modelId);
    
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


async function saveVehicle(currentDate, myData) {
    const image = document.getElementById('vehicleImg');
    const type = document.getElementById("vehicleType").value;
    const brand = document.getElementById("brandName").value;
    const model = document.getElementById("modelType").value;
    const seats = parseFloat(document.getElementById("seats").value);
    const fuelEfficiency = parseFloat(document.getElementById("fuelEfficiency").value);
    const fuelType = document.getElementById("fuelType").value;
    const color = document.getElementById("vehicleColor").value;

    console.log("Form input values:", { type, brand, model, seats, fuelEfficiency, color });

    if (!image || !type || !brand || !model || !seats || !fuelEfficiency || !color || !fuelType) {
        alert('Please fill in all fields!');
        console.error("One or more form fields are missing.");
        return;
    }

    const customId = `${color} ${model} ${fuelEfficiency}`;
    const vehicleRef = doc(db, "vehicles", brand, model, customId);
    const brandRef = doc(db, "vehicles", brand);
    const imgUrl = await useLocalImagePath(image, brand, model);

    console.log("Generated image URL:", imgUrl);

    if (!imgUrl) {
        console.error("Image URL is null. Aborting save operation.");
        return;
    }

    try {
        // Fetch the current brand document
        const brandDoc = await getDoc(brandRef);
        let modelsArray = [];

        // If the brand document exists and has a models array, use it
        if (brandDoc.exists() && brandDoc.data().models) {
            modelsArray = brandDoc.data().models;
        }

        // Check if the model is already in the array
        if (!modelsArray.includes(model)) {
            modelsArray.push(model);
        }

        // Set the brand document with the updated models array
        await setDoc(brandRef, {
            models: modelsArray
        }, { merge: true });

        console.log("Brand details with models array saved successfully!");

        // Set the vehicle document with the vehicle details
        await setDoc(vehicleRef, {
            uid: customId,
            image: imgUrl,
            type,
            brand,
            model,
            seats,
            fuelEfficiency,
            fuelType,
            color
        });

        console.log("Vehicle details saved successfully!");

        document.getElementById('vehicleImg').value = "";
        document.getElementById("vehicleType").value = "";
        document.getElementById("brandName").value = "";
        document.getElementById("modelType").value = "";
        document.getElementById("seats").value = "";
        document.getElementById("fuelEfficiency").value = "";
        document.getElementById("vehicleColor").value = "";

        document.querySelector("#vehicleInfo .img img").src = "Images/gallery.png";
        document.querySelector("#vehicleInfo .img").classList.add("inactive");

        alert("Vehicle details saved successfully!");

        vehicles.push({
            uid: customId,
            images: [imgUrl],
            type,
            brand,
            model,
            seats,
            fuelEfficiency,
            fuelType,
            colors: [color],
        });

        console.log("vehicles", vehicles)

        displayVehicles(currentDate, vehicles.slice(0, 3), myData);
    } catch (error) {
        console.error("Error saving vehicle or brand details: ", error);
        alert("Failed to save vehicle or brand details.");
    }
}

function filterVehicles(currentDate, myData, vehicles, searchTerm = "", selectedType = "", selectedSeats = "") {
    const filteredVehicles = vehicles.filter(vehicle => {
        const matchesSearchTerm = vehicle.brand.toLowerCase().includes(searchTerm) || 
                                  vehicle.model.toLowerCase().includes(searchTerm);
        const matchesType = selectedType ? vehicle.type === selectedType : true;
        const matchesSeats = selectedSeats ? vehicle.seats === parseInt(selectedSeats) : true;

        return matchesSearchTerm && matchesType && matchesSeats;
    });

    displayMoreVehicles(currentDate, myData, filteredVehicles);
}

document.addEventListener("DOMContentLoaded", function() {
    const box = document.querySelector("#vehicleInfo .img");
    const addIcon = box.querySelector("i");
    const fileInput = box.querySelector("input");
    const displayImage = box.querySelector("img");

    if (addIcon && fileInput && displayImage) {
        addIcon.addEventListener("click", function() {
            fileInput.click();
        });

        fileInput.addEventListener("change", function(event) {
            updateImagePreview(event, displayImage, box);
        });
    } else {
        console.error("One or more elements not found.");
    }
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

const deactivateAllSections = () => {
    menuItem.classList.remove("active");
    navItems.forEach(item => item.classList.remove("active"));
};

// Function to activate a specific navigation item and section by index
const activateSection = index => {
    navItems[index]?.classList.add("active");
    activateHTML(document.querySelector("section.active"), sections[index])
};