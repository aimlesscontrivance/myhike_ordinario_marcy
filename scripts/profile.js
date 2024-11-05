// Points to the document of the user who is logged in
var currentUser;

function populateUserInfo() {
    firebase.auth().onAuthStateChanged(user => {
        
        // Check if user is signed in:
        if (user) {

            // Go to the correct user document by referencing to the user uid
            currentUser = db.collection("users").doc(user.uid)
            
            // Get the document for current user
            currentUser.get()
                .then(userDoc => {
                    // Get the data fields of the user
                    let userName = userDoc.data().name;
                    let userSchool = userDoc.data().school;
                    let userCity = userDoc.data().city;

                    // If the data fields are not empty, then write them in to the form.
                    if (userName != null) {
                        document.getElementById("nameInput").value = userName;
                    }
                    if (userSchool != null) {
                        document.getElementById("schoolInput").value = userSchool;
                    }
                    if (userCity != null) {
                        document.getElementById("cityInput").value = userCity;
                    }
                })
        } else {
            // No user is signed in.
            console.log ("No user is signed in");
        }
    });
}

function editUserInfo() {
    // Enable the form fields
    document.getElementById('personalInfoFields').disabled = false;
}

function saveUserInfo() {
    // Enter code here

    // a) get user entered values

    //get the value of the field with id="nameInput"
    userName = document.getElementById('nameInput').value;
    //get the value of the field with id="schoolInput"
    userSchool = document.getElementById('schoolInput').value;
    //get the value of the field with id="cityInput"
    userCity = document.getElementById('cityInput').value;

    // b) update user's document in Firestore
    currentUser.update({
        name: userName,
        school: userSchool,
        city: userCity
    })
    .then(() => {
        console.log("Document successfully updated!");
    })

    // c) disable edit 
    document.getElementById('personalInfoFields').disabled = true;
}

// Call the function to run it 
populateUserInfo();