//------------------------------------------------
// Call this function when the "logout" button is clicked
//-------------------------------------------------
function logout() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log("logging out user");
      }).catch((error) => {
        // An error happened.
      });
}

function getNameFromAuth() {
  firebase.auth().onAuthStateChanged(user => {
      // Check if a user is signed in:
      if (user) {
          // Do something for the currently logged-in user here: 
          console.log(user.uid); //print the uid in the browser console
          console.log(user.displayName);  //print the user name in the browser console
          userName = user.displayName;

          //method #1:  insert with JS
          //document.getElementById("name-goes-here").innerText = userName;    

          //method #2:  insert using jquery
          $("#name-goes-here").text(userName); //using jquery

          //method #3:  insert using querySelector
          //document.querySelector("#name-goes-here").innerText = userName

      } else {
          // No user is signed in.
          console.log ("No user is logged in");
      }
  });
}
getNameFromAuth(); //run the function

// displays the quote based in input param string "tuesday", "monday", etc. 
function readQuote( day ) {
    db.collection( "quotes" ).doc( day ).onSnapshot( doc => {
        console.log("inside");
        console.log( doc.data() );
        document.getElementById( "quote-goes-here" ).innerHTML = doc.data().quote;
    } )
}
// Comment out the next line (we will call this function from doAll())
// readQuote("tuesday");

// Insert name function using the global variable "currentUser"
function insertNameFromFirestore() {
    currentUser.get().then(userDoc => {
        //get the user name
        var user_Name = userDoc.data().name;
        console.log(user_Name);
        $("#name-goes-here").text(user_Name); //jquery
        // document.getElementByID("name-goes-here").innetText=user_Name;
    })
}
// Comment out the next line (we will call this function from doAll())
// insertNameFromFirestore();

//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
function displayCardsDynamically(collection) {
  let cardTemplate = document.getElementById("hikeCardTemplate"); // Retrieve the HTML element with the ID "hikeCardTemplate" and store it in the cardTemplate variable. 

  db.collection(collection).get()   // the collection called "hikes"
      .then(allHikes=> {
          // var i = 1;  // Optional: if you want to have a unique ID for each hike
          allHikes.forEach(doc => { // iterate thru each doc
              var title = doc.data().name;        // get value of the "name" key
              var details = doc.data().details;   // get value of the "details" key
              var hikeCode = doc.data().code;     // get unique ID to each hike to be used for fetching right image
              var hikeLength = doc.data().length; // gets the length field
              var docID = doc.id;                 // read doc ID
              let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.

              //update title and text and image
              newcard.querySelector('.card-title').innerHTML = title;
              newcard.querySelector('.card-length').innerHTML = hikeLength +"km";
              newcard.querySelector('.card-text').innerHTML = details;
              newcard.querySelector('.card-image').src = `./images/${hikeCode}.jpg`; //Example: NV01.jpg
              newcard.querySelector('a').href = "eachHike.html?docID="+docID;
              newcard.querySelector('i').id = 'save-' + docID;   //guaranteed to be unique
              newcard.querySelector('i').onclick = () => updateBookmark(docID);

              //Optional: give unique ids to all elements for future use
              // newcard.querySelector('.card-title').setAttribute("id", "ctitle" + i);
              // newcard.querySelector('.card-text').setAttribute("id", "ctext" + i);
              // newcard.querySelector('.card-image').setAttribute("id", "cimage" + i);
              currentUser.get().then(userDoc => {
                //get the user name
                var bookmarks = userDoc.data().bookmarks;
                if (bookmarks.includes(docID)) {
                   document.getElementById('save-' + docID).innerText = 'bookmark';
                }
              })

              //attach to gallery, Example: "hikes-go-here"
              document.getElementById(collection + "-go-here").appendChild(newcard);

              //i++;   //Optional: iterate variable to serve as unique ID
          })
      })
}

//Global variable pointing to the current user's Firestore document
var currentUser;

// Function that updates a bookmark
function updateBookmark(hikeDocID) {
    currentUser.get().then(doc => {
        let bookmarks = doc.data().bookmarks;

        if (bookmarks.includes(hikeDocID)) {
            currentUser.update({
                bookmarks: firebase.firestore.FieldValue.arrayRemove(hikeDocID)
            })
            .then(function () {
                console.log("bookmark has been removed " + hikeDocID);
                let iconID = 'save-' + hikeDocID;
                //console.log(iconID);
        
                // "Unfills" the icon
                document.getElementById(iconID).innerText = 'bookmark_border';
            });
        } else {
            currentUser.update({
                // Use 'arrayUnion' to add the new bookmark ID to the 'bookmarks' array.
                // This method ensures that the ID is added only if it's not already present, preventing duplicates.
            bookmarks: firebase.firestore.FieldValue.arrayUnion(hikeDocID)
            })
            // Handle the front-end update to change the icon, providing visual feedback to the user that it has been clicked.
            .then(function () {
            console.log("bookmark has been saved for" + hikeDocID);
            let iconID = 'save-' + hikeDocID;
            //console.log(iconID);
    
            // "Fills" the icon
            document.getElementById(iconID).innerText = 'bookmark';
            });
        }

    });
}

// Function that calls everything needed for the main page  
function doAll() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = db.collection("users").doc(user.uid); //global
            console.log(currentUser);

            // figure out what day of the week it is today
            const weekday = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const d = new Date();
            let day = weekday[d.getDay()];

            // the following functions are always called when someone is logged in
            readQuote(day);
            getNameFromAuth();
            displayCardsDynamically("hikes");
        } else {
            // No user is signed in.
            console.log("No user is signed in");
            window.location.href = "login.html";
        }
    });
}
doAll();
