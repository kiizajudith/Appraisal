import React, { useState, useEffect } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, Routes, Route, useLocation } from "react-router-dom";
import logo from "../images/Logo.png";
import Performance from "./performance";
import Technical from "./technical";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"; // Import signOut
import {
  getDatabase,
  ref,
  query,
  orderByChild,
  equalTo,
  get,
} from "firebase/database";
import Profile from "./employeeProfile"; // Assuming Profile component is in the same folder
import PersonalDataDisplay from "./personalData/personalDataDisplay";
import PersonalDataControl from "./personalData/personalControl";
import LandingPage from "./landing";
import TestTable from "./testTable";
import { auth } from "@/firebase/firebase";
import Goals from "./goals";
import Appraisal from "./appraisal";

const navigation = [
  { name: "Home", href: "landing" },
  { name: "Targets", href: "goals"},
  { name: "Appraisal", href: "appraisal" },
  { name: "Performance", href: "performance" },
  { name: "Career Development", href: "growth" }
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ENavbar() {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(
    location.pathname.split("/").pop()
  );
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        user.getIdToken().then((token) => {
          const database = getDatabase();
          const usersRef = ref(database, "users");
          const userQuery = query(
            usersRef,
            orderByChild("email"),
            equalTo(user.email)
          );

          get(userQuery)
            .then((snapshot) => {
              if (snapshot.exists()) {
                const userData = snapshot.val();
                console.log(Object.keys(userData))
                setUserProfile(userData[Object.keys(userData)[0]]);
              } else {
                console.log("User not found in database");
              }
            })
            .catch((error) => {
              console.error("Error querying database:", error);
            });
        });
      }
    });
  }, []);

  const handleItemClick = (href) => {
    setActiveItem(href);
  };

  const toggleProfileModal = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        window.location.href = "/"; // Adjust the redirection as needed
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <div>
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
              <div className="relative flex h-16 items-center justify-between">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex flex-shrink-0 items-center">
                    <img src={logo} alt="Logo" className="mx-auto h-12 w-24" />
                  </div>
                  <div className="hidden sm:ml-6 sm:block">
                    <div className="flex space-x-4">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          to={`/employee/${item.href}`}
                          className={classNames(
                            item.href === activeItem
                              ? "bg-gray-900 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white",
                            "rounded-md px-3 py-2 text-sm font-medium"
                          )}
                          onClick={() => handleItemClick(item.href)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-8 w-8 rounded-full"
                          src={
                            userProfile && userProfile.imageUrl
                              ? userProfile.imageUrl
                              : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                          }
                          alt="User profile"
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                              onClick={toggleProfileModal}
                            >
                              Your Profile
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                              onClick={handleSignOut}
                            >
                              Sign out
                            </a>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={`/employee/${item.href}`}
                    className={classNames(
                      item.href === activeItem
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "block rounded-md px-3 py-2 text-base font-medium"
                    )}
                    aria-current={item.href === activeItem ? "page" : undefined}
                    onClick={() => handleItemClick(item.href)}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Profile modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <Profile onClose={toggleProfileModal} />
        </div>
      )}

      {/* Routes */}
      <Routes>
        <Route path="landing" element={<LandingPage />} />
        <Route path="growth" element={<Technical />} />
        <Route path="appraisal" element={<Appraisal email={auth.currentUser.email} />} />
        <Route path="goals" element={<Goals email={auth.currentUser.email} />} />
        <Route path="performance" element={<Performance />} />
      </Routes>
    </div>
  );
}
