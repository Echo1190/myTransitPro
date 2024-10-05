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
    getFirestore, collection, getDocs, limit, serverTimestamp,
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
const storage = getStorage();
const messaging = getMessaging(app);
const functions = getFunctions(app, 'us-central1');








/* -----------------------------         Loader         ------------------------------------ */









async function fadeInLoader() {
    const loader = document.querySelector('header');
    const loaderImage = loader.querySelector('img');
    loaderImage.classList.add('animate');
    loader.classList.add('active');
    updateProgressBar(10)
}

async function fadeOutLoader() {   
    const loader = document.querySelector('header');
    const loaderImage = loader.querySelector('img');
    completeProgressBar()
    loader.classList.remove('active');  

    setTimeout(function() {
        loaderImage.classList.remove('animate');
    }, 500);
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









document.addEventListener("DOMContentLoaded", function() {
    handleScrollAndClick();
    scrollToHashOrHome();
});

function scrollToHashOrHome() {
    const hash = window.location.hash;
    let targetId = hash ? hash.substring(1) : "home"; // Default to "home" if no hash
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
        const targetPosition = targetSection.offsetTop - ((window.innerHeight - targetSection.clientHeight) / 2) - 150;
        window.scrollTo({
            top: targetPosition,
            behavior: "smooth"
        });
    }
}

const quotationBtn = document.querySelector(".quotation-btn");
quotationBtn.addEventListener("click", function(event) {
    event.preventDefault();
    
    const lastSection = document.querySelector("main section:last-of-type");
    const targetPosition = lastSection.offsetTop - ((window.innerHeight - lastSection.clientHeight) / 2) - 150;

    window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
    });
});

function handleScrollAndClick() {
    const header = document.querySelector("header");
    const sections = document.querySelectorAll("main section");
    const navLi = document.querySelectorAll("header ul li a");

    window.addEventListener("scroll", function() {
        const viewportHeight = window.innerHeight * 0.1;
        header.classList.toggle("sticky", window.scrollY > viewportHeight);

        let current = "";

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute("id");
            }
        });

        navLi.forEach(a => {
            a.parentElement.classList.remove("active");
            if (a.getAttribute("href").substring(1) === current) {
                a.parentElement.classList.add("active");
            }
        });
    });

    navLi.forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            e.preventDefault();

            const targetId = this.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetId === "home") {
                // Scroll to the top for home section
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            } else {
                // Scroll to the target section
                const targetPosition = targetSection.offsetTop - ((window.innerHeight - targetSection.clientHeight) / 2) - 150;
                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const menuIcon = document.getElementById('menu-icon');
    const header = document.querySelector('header');

    menuIcon.addEventListener('click', function() {
        header.classList.toggle('active');
    });
});










/* -----------------------------         Main (Home)         ------------------------------------ */









window.addEventListener('scroll', function() {
    const home = document.querySelector('#home');
    
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollRatio = scrolled / maxScroll;
    const newWidth = 100 - (scrollRatio * 200); // Decrease width from 100% to 0%

    home.style.width = `${Math.max(newWidth, 0)}%`; // Ensure width doesn't go below 0%
    home.style.marginLeft = 'auto';
    home.style.marginRight = 'auto';
});

document.addEventListener('DOMContentLoaded', () => {
    const options = {
        root: null, // Use the viewport as the container
        rootMargin: '0px',
        threshold: 0.5 // Adjust this value to when the card should be considered 'in view'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Clear any existing timeout
                if (entry.target.timeoutId) {
                    clearTimeout(entry.target.timeoutId);
                    entry.target.timeoutId = null;
                }
            } else {
                entry.target.timeoutId = setTimeout(() => {
                    entry.target.classList.remove('active');
                }, 300); // Delay in milliseconds (e.g., 1000ms = 1s)
            }
        });
    }, options);

    const cards = document.querySelectorAll('#services .card');
    cards.forEach(card => {
        observer.observe(card);
    });

    const img = document.querySelector('#about .img');
    observer.observe(img);
});









/* -----------------------------         Main (Join: Customer)         ------------------------------------ */









async function queryVendorByCode() {
    // Check if the vendor data is already in local storage
    const storedVendor = localStorage.getItem(`myVendor`);
    if (storedVendor) {
        const vendorData = JSON.parse(storedVendor);
        displayVendorInfo(vendorData);
        hideStoresList();
        return;
    }

    // Extract the code from the URL
    const code = new URLSearchParams(window.location.search).get("ref");
    if (!code) {
        console.log('No code found in the URL');
        openStoresList();
        document.querySelector('#selectedVendor').addEventListener('click', openStoresList);
        return;
    }

    try {
        // Query the Firestore database
        const vendorQuery = query(collection(db, 'vendors'), where('name', '==', code));
        const querySnapshot = await getDocs(vendorQuery);

        if (querySnapshot.empty) {
            console.log('No matching vendor found');
            openStoresList();
            document.querySelector('#selectedVendor').addEventListener('click', openStoresList);
            return;
        }

        const firstDoc = querySnapshot.docs[0];
        if (firstDoc) {
            const vendorData = firstDoc.data();
            // Save the vendor data to local storage
            localStorage.setItem(`myVendor`, JSON.stringify(vendorData));
            displayVendorInfo(vendorData);
        }
    } catch (error) {
        console.error('Error querying vendor:', error);
    }
}

function displayVendorInfo(vendorData) {
    // Display vendor information
    document.querySelector('.vendor-box#selectedVendor').classList.add("active");
    document.querySelector('#selectedVendor .name').textContent = vendorData.name;
    document.querySelector('#selectedVendor .type').textContent = vendorData.type;
    document.querySelector('#selectedVendor .img img').src = vendorData.logoUrl || 'Images/gallery.png';
}

document.getElementById('searchCompany').addEventListener('input', handleSearch);

function openStoresList() {
    const storesList = document.querySelector(".stores-list");

    storesList.style.display = "flex";
    setTimeout(() => {
        storesList.style.opacity = "1";
    }, 300);

    const closeButton = storesList.querySelector(".ri-close-fill");
    closeButton.addEventListener("click", hideStoresList, { once: true });
}

function hideStoresList() {
    const storesList = document.querySelector(".stores-list");

    storesList.style.opacity = "0";
    setTimeout(() => {
        storesList.style.display = "none";
    }, 300);
}

async function getVendors() {
    const vendorCol = collection(db, "vendors");
    const vendorsSnapshot = await getDocs(query(vendorCol));
    displayStoresList(vendorsSnapshot);
}

async function displayStoresList(vendors) {
    const storesList = document.querySelector(".stores-list");
    const listBox = storesList.querySelector(".body");

    try {
        // Clear existing store items
        listBox.innerHTML = "";

        // Create a document fragment to minimize reflows
        const fragment = document.createDocumentFragment();

        // Iterate over each vendor and create a list item
        vendors.forEach((vendorDoc) => {
            const vendorData = vendorDoc.data();
            const vendorBox = document.createElement("div");
            vendorBox.classList.add("vendor-box");

            vendorBox.innerHTML = `
                <div class="img">
                    <img src="${vendorData.logo || 'Images/gallery.png'}" alt="${vendorData.name}">
                </div>
                <div class="name">${vendorData.name}</div>
                <div class="type">${vendorData.type}</div>
            `;

            vendorBox.addEventListener("click", () => {
                localStorage.setItem(`myVendor`, JSON.stringify(vendorData));

                document.querySelector('.vendor-box#selectedVendor').classList.add("active");
                document.querySelector('#selectedVendor .name').textContent = vendorData.name;
                document.querySelector('#selectedVendor .type').textContent = vendorData.type;
                document.querySelector('#selectedVendor .img img').src = vendorData.logoUrl || 'Images/gallery.png';

                hideStoresList();
            });

            vendorBox.dataset.name = vendorData.name.toLowerCase();
            vendorBox.dataset.type = vendorData.type.toLowerCase();
            fragment.appendChild(vendorBox);
        });

        // Append the fragment to the listBox
        listBox.appendChild(fragment);
    } catch (error) {
        console.error("Error fetching vendors:", error);
    }
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const vendorBoxes = document.querySelectorAll(".stores-list .vendor-box");

    vendorBoxes.forEach(vendorBox => {
        const name = vendorBox.dataset.name;
        const type = vendorBox.dataset.type;
        if (name.includes(searchTerm) || type.includes(searchTerm)) {
            vendorBox.style.display = "flex";
        } else {
            vendorBox.style.display = "none";
        }
    });
}

getVendors();
queryVendorByCode();

function setupBookingListener() {
    // Listening for custom events that indicate a booking update
    document.addEventListener('bookingUpdated', function() {
        updateBookingDetails();
    });

    updateBookingDetails(); // Update details on initialization or setup
}

function updateBookingDetails() {
    // Fetch the latest booking details from local storage
    const bookingDetails = JSON.parse(localStorage.getItem('myTransitBookings'));
    console.log(bookingDetails)
    
    // Get the swiper container that holds booking slides
    const bookingsContainer = document.querySelector('.bookings');

    // Clear existing bookings from the swiper
    bookingsContainer.innerHTML = '<div class="info">Swipe to generate your quotation . . .</div>';

    // Check if bookingDetails exist
    if (!bookingDetails || bookingDetails.length === 0) {
        console.log('No booking details available.');
        bookingsContainer.innerHTML = '<p>No booking details available.</p>';
        return;
    }

    // Create a document fragment to hold the new content
    const fragment = document.createDocumentFragment();

    function formatDateWithoutYear(dateString) {
        const date = new Date(dateString);
        const parts = date.toDateString().split(' '); // Split "Wed Jan 01 2024" into parts
        return parts.slice(1, 3).join(' '); // Rejoin parts excluding the first ("Wed") and last ("2024")
    }

    // Iterate over each booking and create a booking box for each
    bookingDetails.forEach((booking, index) => {
        const startDate = formatDateWithoutYear(booking.startDate);

        const bookingBox = document.createElement('div');
        bookingBox.className = "booking-box";
        bookingBox.setAttribute('data-index', index);
        bookingBox.innerHTML = `
            <i class="ri-close-fill" style="cursor:pointer;"></i>

            <div class="img">
                <img src="${booking.img || '/Images/map.png'}" alt="Booking Map">
            </div>

            <div class="line">
                <div class="date-time"> ${startDate} at ${booking.pickUpTime}</div>
                <div class="location"><b>Pick Up:</b>${booking.pickUpAddress}</div>
                <div class="location"><b>Drop Off:</b>${booking.dropOffAddress}</div>
            </div>
        `;

        if (index === 0) {
            bookingBox.style.marginTop = "50px";
        }

        // Append the booking box to the document fragment
        fragment.appendChild(bookingBox);

        // Add event listener to the close button
        bookingBox.querySelector('.ri-close-fill').addEventListener('click', function() {
            removeBooking(index);
        });

        // Add event listener to the image for opening the modal
        bookingBox.querySelector('.img img').addEventListener('click', function() {
            openModal(this);
        });
    });

    // Append the document fragment to the swiper container
    bookingsContainer.appendChild(fragment);
}

function removeBooking(indexToRemove) {
    // Fetch existing bookings from local storage
    let bookings = JSON.parse(localStorage.getItem('myTransitBookings')) || [];

    // Remove the booking at the specified index
    bookings.splice(indexToRemove, 1);

    // Save the updated array back to local storage
    localStorage.setItem('myTransitBookings', JSON.stringify(bookings));

    // Dispatch custom event to update booking details across components
    document.dispatchEvent(new Event('bookingUpdated'));
}

function openModal(imageElement) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const captionText = document.getElementById('caption');

    modal.style.display = "block";
    modalImg.src = imageElement.src;
    captionText.innerHTML = imageElement.alt;

    const span = document.getElementsByClassName('close')[0];
    span.onclick = function() {
        modal.style.display = "none";
    };
}

document.getElementById('addBooking').addEventListener('click', async function(e) {
    e.preventDefault();
    e.stopPropagation();

    fadeInLoader();
    updateProgressBar(0);

    // Retrieve input values
    const startDate = document.getElementById('startDate').value;
    const pickUpTime = document.getElementById('pickUpTime').value;
    const pickUpLocation = document.getElementById('pickUpLocation').value;
    const dropOffLocation = document.getElementById('dropOffLocation').value;
    const seats = document.getElementById('seats').value;

    // Fetch the map image URL and ETA
    updateProgressBar(30);
    const { pickUpAddress, dropOffAddress, distance, eta, mapImageUrl } = await getMapData(pickUpLocation, dropOffLocation);
    updateProgressBar(60);

    // Create an object to store booking details including the map image URL and ETA
    const bookingDetails = {
        startDate,
        pickUpTime,
        pickUpAddress,
        dropOffAddress,
        image: mapImageUrl,
        distance,
        eta,
        seats,
    };

    updateProgressBar(80);

    // Fetch existing bookings from local storage
    let bookings = JSON.parse(localStorage.getItem('myTransitBookings')) || [];

    // Add the new booking to the array
    bookings.push(bookingDetails);

    // Save the updated array back to local storage
    localStorage.setItem('myTransitBookings', JSON.stringify(bookings));

    // Clear input fields
    document.getElementById('startDate').value = '';
    document.getElementById('pickUpTime').value = '';
    document.getElementById('pickUpLocation').value = '';
    document.getElementById('dropOffLocation').value = '';
    document.getElementById('seats').value = '';

    // Dispatch custom event to update booking details across components
    document.dispatchEvent(new Event('bookingUpdated'));
    fadeOutLoader();
});

async function getMapData(pickUpLocation, dropOffLocation) {
    const fetchMapData = httpsCallable(functions, 'fetchMapData');
    try {
        const result = await fetchMapData({ pickUpLocation, dropOffLocation });
        console.log(result.data);
        return result.data;
    } catch (error) {
        console.error('Failed to fetch address and distance:', error);
        return { distance: 'Failed to fetch distance', formattedPickUpLocation: null, formattedDropOffLocation: null };
    }
}

setupBookingListener();

document.getElementById('customerSignUp').addEventListener('click', async (e) => {
    e.stopPropagation();
    fadeInLoader();
    updateProgressBar(0);

    const vendorData = JSON.parse(localStorage.getItem('myVendor'));
    const bookingDetails = JSON.parse(localStorage.getItem('myTransitBookings'));

    const name = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;
    const email = document.getElementById('email').value;
    const tel = document.getElementById('tel').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm').value;

    if (!vendorData) {
        alert('Select a company!');
        return;
    }

    updateProgressBar(10);

    if (!bookingDetails) {
        alert('Add a booking!');
        return;
    }

    updateProgressBar(20);

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    updateProgressBar(30);

    if (!name || !surname || !email || !tel || !password || !confirmPassword) {
        alert('Fill in all fields!');
        return;
    }

    updateProgressBar(40);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', `${name}${surname} (${user.uid})`), {
            name: name,
            surname: surname,
            email: email,
            tel: tel,
            uid: user.uid,
            vendor: vendorData.uid,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        updateProgressBar(60);

        const bookingsCollectionRef = collection(db, 'users', `${name}${surname} (${user.uid})`, 'bookings');

        // Group bookings by startDate
        const bookingsByDate = bookingDetails.reduce((acc, booking) => {
            const date = booking.startDate;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(booking);
            return acc;
        }, {});

        updateProgressBar(80);

        // Save grouped bookings to Firestore
        for (const [startDate, bookings] of Object.entries(bookingsByDate)) {
            await setDoc(doc(bookingsCollectionRef, startDate), {
                trips: bookings.map(booking => ({
                    ...booking,
                })),
                startDate: startDate,
                createdAt: new Date(),
                updatedAt: new Date(),
                price: 0,
                status: "Pending...",
            });
        }

        // Clear the input fields
        document.getElementById('name').value = '';
        document.getElementById('surname').value = '';
        document.getElementById('email').value = '';
        document.getElementById('tel').value = '';
        document.getElementById('password').value = '';
        document.getElementById('confirm').value = '';

        // Clear the booking details from local storage
        localStorage.removeItem('myTransitBookings');

        console.log('Account created successfully!');
        fadeOutLoader();
    } catch (error) {
        console.error('Error creating account:', error);
        alert('Error creating account: ' + error.message);
    }
});

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

document.addEventListener("DOMContentLoaded", function() {
    const toggleCheck = document.querySelector('.toggle__check');
    const customerCard = document.getElementById('customer');
    const businessCard = document.getElementById('business');

    toggleCheck.addEventListener('change', function() {
        if (this.checked) {
            customerCard.classList.remove('active');
            businessCard.classList.add('active');
        } else {
            customerCard.classList.add('active');
            businessCard.classList.remove('active');
        }
    });
});









/* -----------------------------         Main (Join: Business)         ------------------------------------ */









document.addEventListener("DOMContentLoaded", function() {
    const selectAreas = document.getElementById("selectAreas");
    const selectionBox = document.querySelector(".areas .selection-box");
    selectionBox.innerHTML = '';

    selectAreas.addEventListener("change", function() {
        const selectedOption = selectAreas.options[selectAreas.selectedIndex];
        const areaValue = selectedOption.value;
        const areaText = selectedOption.text;

        // Check if the area is already added
        if (!isAreaAdded(areaValue)) {
            addAreaToSelectionBox(areaValue, areaText);
        }
    });

    function isAreaAdded(value) {
        const existingItems = selectionBox.querySelectorAll("li");
        for (let item of existingItems) {
            if (item.dataset.value === value) {
                return true;
            }
        }
        return false;
    }

    function addAreaToSelectionBox(value, text) {
        const listItem = document.createElement("li");
        listItem.dataset.value = value;
        listItem.innerHTML = `${text} <i class="ri-close-fill" style="cursor: pointer;"></i>`;
        
        // Add event listener to the close icon
        listItem.querySelector("i").addEventListener("click", function() {
            listItem.remove();
        });

        selectionBox.appendChild(listItem);
    }
});

document.getElementById('businessSignUp').addEventListener('click', async (e) => {
    e.stopPropagation();
    fadeInLoader();
    updateProgressBar(0);

    const name = document.getElementById('Name').value;
    const surname = document.getElementById('Surname').value;
    const business = document.getElementById('Business').value;
    const registration = document.getElementById('registration').value;
    const tel = document.getElementById('Tel').value;
    const email = document.getElementById('Email').value;
    const website = document.getElementById('Website').value;

    if (!name || !surname || !business || !registration || !tel || !email) {
        alert('Please fill in all fields.');
        return;
    }

    updateProgressBar(10);

    const selectionBox = document.querySelector(".selection-box");
    const selectedAreas = Array.from(selectionBox.querySelectorAll("li")).map(li => li.dataset.value);

    // Check if areas are selected
    if (selectedAreas.length === 0) {
        alert('Please select at least one area.');
        return;
    }

    updateProgressBar(20);

    // Check if all required files are uploaded
    const licenseFile = document.getElementById('License').files[0];
    const insuranceFile = document.getElementById('Insurance').files[0];
    const certificationFile = document.getElementById('Certification').files[0];
    const portfolioFile = document.getElementById('Portfolio').files[0];
    const bankStatementFile = document.getElementById('bankStatement').files[0];

    if (!licenseFile || !insuranceFile || !certificationFile || !portfolioFile || !bankStatementFile) {
        alert('Please upload all required documents.');
        return;
    }

    // Generate a default password
    const defaultPassword = `${business.slice(0, 4)}${registration.slice(-4)}`;

    updateProgressBar(30);

    try {
        // Create user with default password
        const userCredential = await createUserWithEmailAndPassword(auth, email, defaultPassword);
        const user = userCredential.user;

        // Function to upload a file
        const uploadFile = async (file, folderName) => {
            const fileRef = ref(storage, `vendors/${business}/${folderName}`);
            await uploadBytes(fileRef, file);
            return await getDownloadURL(fileRef);
        };

        updateProgressBar(50);

        // Upload documents
        const licenseUrl = await uploadFile(licenseFile, 'license');
        const insuranceUrl = await uploadFile(insuranceFile, 'insurance');
        const certificationUrl = await uploadFile(certificationFile, 'certification');
        const portfolioUrl = await uploadFile(portfolioFile, 'portfolio');
        const bankStatementUrl = await uploadFile(bankStatementFile, 'bankStatement');

        updateProgressBar(60);

        // Save vendor details to Firestore
        await setDoc(doc(db, 'vendors', `${business} (${user.uid})`), {
            name: name,
            surname: surname,
            business: business,
            registration: registration,
            tel: tel,
            email: email,
            areas: selectedAreas,
            uid: user.uid,
            website: website,
            createdAt: new Date(),
            updatedAt: new Date(),
            documents: {
                license: licenseUrl,
                insurance: insuranceUrl,
                certification: certificationUrl,
                portfolio: portfolioUrl,
                bankStatement: bankStatementUrl
            }
        });

        updateProgressBar(80);

        // Clear the form fields
        document.getElementById('Name').value = '';
        document.getElementById('Surname').value = '';
        document.getElementById('Business').value = '';
        document.getElementById('registration').value = '';
        document.getElementById('Tel').value = '';
        document.getElementById('Email').value = '';
        document.getElementById('Website').value = '';
        selectionBox.innerHTML = '';
        document.getElementById('License').value = '';
        document.getElementById('Insurance').value = '';
        document.getElementById('Certification').value = '';
        document.getElementById('Portfolio').value = '';
        document.getElementById('bankStatement').value = '';

        fadeOutLoader();
        alert('We will contact you shortly with your approval status!');
    } catch (error) {
        console.error('Error creating vendor account:', error);
        alert('Error creating vendor account.');
    }
});









/* -----------------------------         Authentication         ------------------------------------ */









let hasRun = false;

onAuthStateChanged(auth, async (user) => {
    if (hasRun) return;
    hasRun = true;

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
});