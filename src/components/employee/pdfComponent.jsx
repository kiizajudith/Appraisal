import React from "react";
import UploadPdf from "./pdfUpload";
import RetrievePdfs from "./pdfDisplay";

const Pdf = () => {
  return (
    <div className="App">
      <h1>Upload and Retrieve PDFs</h1>
      <UploadPdf />
      <RetrievePdfs />
    </div>
  );
};

export default Pdf;
