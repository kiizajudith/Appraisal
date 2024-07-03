import React, { useEffect, useState } from "react";
import moment from "moment";
import { auth, database } from "../../firebase/firebase"; // Adjust the import path as needed
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import image1 from "../images/image1.jpg";
import image2 from "../images/image2.jpg";

const gds = [
  {
    title: "About System",
    desc: "This system is to be used to obtain feedback and progress from all employees for appraisal and supervision purposes."
  },
  {
    title: "Targets",
    desc: "You can visit the targets tab in the navigation bar to access the targets section through which your quarterly targets can be set."
  },
  {
    title: "Appraisal",
    desc: "Through the appraisal tab, you can submit an assessment of yourself to your supervisor for review and final assessment."
  },
  {
    title: "Performance",
    desc: "You can continuously check for feedback on performance from your supervisor and admin."
  },
  {
    title: "Career Development",
    desc: "Use this page to edit and add your academic and professional qualifications that are crucial for your assessment in this department."
  }
]

export default function LandingPage() {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const email = user.email;
          const usersRef = ref(database, "users");
          const userQuery = query(
            usersRef,
            orderByChild("email"),
            equalTo(email)
          );
          const snapshot = await get(userQuery);

          if (snapshot.exists()) {
            const userData = snapshot.val();
            const userId = Object.keys(userData)[0];
            setUserDetails(userData[userId]);
          } else {
            console.error("No user data found!");
          }
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  // Get the current date
  const currentDate = moment().format("MMMM Do, YYYY");

  // Determine the current quarter
  const month = moment().month(); // 0-11
  let quarter = "";
  if (month < 3) {
    quarter = "1st Quarter";
  } else if (month < 6) {
    quarter = "2nd Quarter";
  } else if (month < 9) {
    quarter = "3rd Quarter";
  } else {
    quarter = "4th Quarter";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center bg-fixed"
    >
      {/* Overlay for blur effect */}
      <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-md"></div>

      <div className="relative z-10 bg-white bg-opacity-90 rounded-lg shadow-lg overflow-hidden w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 backdrop-blur-sm">
        <div className="relative">
          <img
            src={image1}
            alt="Background"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-white">{quarter}</h2>
            <p className="text-lg text-gray-300 mt-2">{currentDate}</p>
          </div>
        </div>
        <div className="p-6">
          {userDetails ? (
            <div>
              <h3 className="text-xl font-semibold">
                Welcome, {userDetails.givenName} {userDetails.surname}
              </h3>
              <h6>The following are the system usage and utilisation guidelines that we think you should know about:</h6>
              <ul style={{ listStyle: 'outside', paddingLeft: '32px', paddingTop: '16px' }}>
                {gds.map(gd => (
                  <li><p><span style={{ fontWeight: '600'}}>{gd.title}</span>{gd.desc}</p></li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-700">User details not found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
