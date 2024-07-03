import { useState } from "react";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { imgDB } from "../../firebase/firebase"; // Make sure the path is correct

const UploadPdf = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, success, error

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus("uploading");

    try {
      const fileRef = storageRef(imgDB, `pdfs/${selectedFile.name}`);

      // Upload the file to Firebase Storage
      await uploadBytes(fileRef, selectedFile);

      // Get the download URL
      const downloadURL = await getDownloadURL(fileRef);
      console.log("File available at", downloadURL);

      setUploadStatus("success");
      setSelectedFile(null); // Clear file selection after successful upload
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("error");
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      {uploadStatus === "idle" && <p>Select a PDF file to upload.</p>}
      {uploadStatus === "uploading" && <p>Uploading...</p>}
      {uploadStatus === "success" && <p>File uploaded successfully!</p>}
      {uploadStatus === "error" && (
        <p>Error uploading file. Please try again.</p>
      )}
      <button onClick={handleUpload} disabled={!selectedFile}>
        Upload
      </button>
    </div>
  );
};

export default UploadPdf;
