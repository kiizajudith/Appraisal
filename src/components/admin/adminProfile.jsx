import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  getDatabase,
  ref,
  query,
  orderByChild,
  equalTo,
  get,
} from "firebase/database";
import { jwtDecode } from "jwt-decode";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Profile({ onClose }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const idToken = localStorage.getItem("idToken");
        if (!idToken) {
          throw new Error("No ID token found in local storage");
        }

        const decodedToken = jwtDecode(idToken);
        console.log("Decoded Token:", decodedToken);

        const database = getDatabase();
        const usersRef = ref(database, "users");
        const userQuery = query(
          usersRef,
          orderByChild("email"),
          equalTo(decodedToken.email)
        );

        const snapshot = await get(userQuery);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserProfile(userData[Object.keys(userData)[0]]);
        } else {
          console.log("User not found in database");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        User profile not found
      </div>
    );
  }

  const {
    imageUrl = "/placeholder.svg",
    surname = "",
    givenName = "",
    contact = "",
    email = "",
    personnelType = "",
    salary = "",
  } = userProfile;

  const closeModal = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-lg mx-4 sm:mx-auto h-full sm:h-auto">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          onClick={closeModal}
        >
          <XIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 overflow-y-auto h-full sm:h-auto">
          <div className="col-span-1 sm:col-span-2 flex items-center justify-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={imageUrl} alt="Profile" />
              <AvatarFallback></AvatarFallback>
            </Avatar>
          </div>
          <div className="space-y-2">
            <Label htmlFor="surname">Surname</Label>
            <Input id="surname" defaultValue={surname} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="givenName">Given Name</Label>
            <Input id="givenName" defaultValue={givenName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Contact</Label>
            <Input id="contact" defaultValue={contact} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="personnelType">Personnel Type</Label>
            <Input
              id="personnelType"
              type="text"
              defaultValue={personnelType}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary">Salary</Label>
            <Input id="salary" type="number" defaultValue={salary} />
          </div>
        </div>
      </div>
    </div>
  );
}

function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
