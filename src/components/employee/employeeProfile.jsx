import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  getDatabase,
  ref,
  query,
  orderByChild,
  equalTo,
  get,
  set,
} from "firebase/database";
import { database } from "../../firebase/firebase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";

export default function Profile({ onClose }) {
  const [userProfile, setUserProfile] = useState(null);
  const [key, userKey] = useState("")
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();

          const database = getDatabase();
          const usersRef = ref(database, "users");
          const userQuery = query(
            usersRef,
            orderByChild("email"),
            equalTo(currentUser.email)
          );

          const snapshot = await get(userQuery);

          if (snapshot.exists()) {
            const userData = snapshot.val()[Object.keys(snapshot.val())[0]]
            if (!(userData.directorate == undefined)) {
              userData.directorate = "K"
              userData.department = ""
              userData.presentAppointment = ""
              userData.appointmentDate = ""
              userData.appraisalPeriod = ""
            }
            userKey(Object.keys(snapshot.val())[0])
            setUserProfile(userData);
          } else {
            console.log("User not found in database");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userProfile) {
    return <div>User profile not found</div>;
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

  const handleChange = (e) => {
    let up = userProfile
    up[e.target.id] = e.target.value
    console.log(up)
    setUserProfile(up)
  }

  const handleSubmit = (e) => {
    const updateRef = ref(
      database,
      `users/${key}`
    );

    set(updateRef, userProfile).then(closeModal).catch((error) =>{console.log(error)})
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-3xl" style={{ overflowY: 'scroll'}}>
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          onClick={closeModal}
        >
          <XIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="surname">Surname</Label>
            <Input id="surname" value={userProfile.surname} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="givenName">Given Name</Label>
            <Input id="givenName" value={userProfile.givenName} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Contact</Label>
            <Input id="contact" value={userProfile.contact} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={userProfile.email} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="personnelType">Personnel Type</Label>
            <Input
              id="personnelType"
              type="text"
              value={userProfile.personnelType}
              onChange={handleChange} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary">Salary</Label>
            <Input id="salary" type="number" defaultValue={salary} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="directorate">Directorate</Label>
            <Input
              id="directorate"
              placeholder="Enter your directorate"
              value={userProfile.directorate}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="Enter your department"
              value={userProfile.department}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="presentAppointmentText">Present Appointment</Label>
            <Input
              id="presentAppointmentText"
              placeholder="Enter present appointment"
              value={userProfile.presentAppointment}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="presentAppointmentDate">Appointment Date</Label>
            <Input
              id="presentAppointmentDate"
              type="date"
              value={userProfile.appointmentDate}
              onChange={handleChange}
            />
          </div>
        </div>
        <Button onClick={handleSubmit}>Save Changes</Button>
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
