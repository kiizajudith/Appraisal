import { useState, useEffect } from "react";
import { ref as databaseRef, onValue, off } from "firebase/database"; // Ensure 'off' is imported
import { database } from "../../firebase/firebase"; // Make sure the path is correct

const RetrievePdfs = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pdfsRef = databaseRef(database, "pdfs");
    const unsubscribe = onValue(pdfsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const pdfList = Object.keys(data).map((key) => ({
          name: data[key].name,
          url: data[key].url,
        }));
        setPdfs(pdfList);
      } else {
        setPdfs([]);
      }
      setLoading(false);
    });

    // Properly remove the listener when the component unmounts
    return () => {
      off(pdfsRef);
    };
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col space-y-4">
      {pdfs.length > 0 ? (
        pdfs.map((pdf, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 border rounded"
          >
            <span>{pdf.name}</span>
            <a href={pdf.url} download={pdf.name} className="text-blue-500">
              Download
            </a>
          </div>
        ))
      ) : (
        <p>No PDF files found.</p>
      )}
    </div>
  );
};

export default RetrievePdfs;
