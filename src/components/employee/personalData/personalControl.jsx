import React, { useState, useEffect } from "react";
import { database, auth } from "../../../firebase/firebase"; // Adjust the import path as needed
import { ref, get } from "firebase/database";
import PersonalData from "./personalData";
import PersonalDataDisplay from "./personalDataDisplay";

const encodeEmail = (email) =>
  email.replace(
    /[@.]/g,
    (char) =>
      ({
        "@": "_at_",
        ".": "_dot_",
      }[char])
  );

export default function PersonalDataControl() {
  const [loading, setLoading] = useState(true);
  const [dataExists, setDataExists] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPersonalData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const email = user.email;
          const encodedEmail = encodeEmail(email);
          const dataRef = ref(database, "personnelData/" + encodedEmail);
          const snapshot = await get(dataRef);

          if (snapshot.exists()) {
            setDataExists(true);
          } else {
            setDataExists(false);
          }
        } else {
          setError("User not authenticated.");
        }
      } catch (error) {
        setError("Error checking data. Please try again.");
        console.error("Error checking data:", error);
      } finally {
        setLoading(false);
      }
    };

    checkPersonalData();
  }, []);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return dataExists ? <PersonalDataDisplay /> : <PersonalData />;
}
