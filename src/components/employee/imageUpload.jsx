import React, { useState } from "react";
import { imgDB, database } from "../../firebase/firebase"; // Import db from firebase setup
import { v4 } from "uuid";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { ref as dbRef, set } from "firebase/database"; // Import required functions for Realtime Database

const ImageStore = () => {
  const [txt, setTxt] = useState("");
  const [imgURL, setImgURL] = useState("");

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgRef = ref(imgDB, `Imgs/${v4()}`);
    uploadBytes(imgRef, file).then((snapshot) => {
      console.log(snapshot, "img uploaded");
      getDownloadURL(snapshot.ref).then((url) => {
        console.log(url);
        setImgURL(url); // Set the image URL state
      });
    });
  };

  const handleSubmit = () => {
    if (txt && imgURL) {
      const itemId = v4(); // Generate a unique ID for each item
      set(dbRef(database, `images/${itemId}`), {
        text: txt,
        imageUrl: imgURL,
      })
        .then(() => {
          console.log("Data saved successfully!");
          setTxt(""); // Clear the text input
          setImgURL(""); // Clear the image URL
        })
        .catch((error) => {
          console.error("Error saving data: ", error);
        });
    } else {
      alert("Please upload an image and enter some text.");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={txt}
        onChange={(e) => setTxt(e.target.value)}
        placeholder="Enter some text"
      />
      <input type="file" onChange={handleUpload} />
      {imgURL && (
        <div>
          <p>Image uploaded successfully!</p>
          <img src={imgURL} alt="Uploaded" />
        </div>
      )}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default ImageStore;
