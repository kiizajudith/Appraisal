import { useState, useEffect } from "react";
import {
  database,
  ref,
  onValue,
  off,
  remove,
  update,
} from "../../firebase/firebase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Create from "./create";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [supervisor, setSupervisor] = useState("");
  const [supervisors, setSupervisors] = useState([]);


  useEffect(() => {
    const usersRef = ref(database, "users");

    const fetchData = async () => {
      try {
        onValue(usersRef, (snapshot) => {
          const usersData = snapshot.val();
          if (usersData) {
            const usersArray = Object.keys(usersData).map((key) => ({
              id: key,
              ...usersData[key],
            }));
            setUsers(usersArray);
          } else {
            setUsers([]);
          }
        });
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchData();

    return () => {
      off(usersRef);
    };
  }, []);

  useEffect(() => {
    const fetchSupervisors = () => {
      const usersRef = ref(database, "users");
      onValue(usersRef, (snapshot) => {
        const users = snapshot.val();
        if (users) {
          const supervisorUsers = Object.entries(users)
            .filter(([id, user]) => user.personnelType === "supervisor")
            .map(([id, user]) => ({ id, ...user }));
          setSupervisors(supervisorUsers);
        }
      });
      return () => {
        off(usersRef);
      };
    };
    fetchSupervisors();
  }, []);

  const handleEdit = (user) => {
    setCurrentUser(user);
    setIsEditing(true);
  };

  const handleDelete = async (userId) => {
    try {
      const userRef = ref(database, `users/${userId}`);
      await remove(userRef);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    const { givenName, surname, email, contact, personnelType, salary } =
      event.target.elements;
    const updatedUser = {
      givenName: givenName.value,
      surname: surname.value,
      email: email.value,
      contact: contact.value,
      supervisor: supervisor,
      personnelType: personnelType.value,
      salary: salary.value,
    };

    try {
      const userRef = ref(database, `users/${currentUser.id}`);
      await update(userRef, updatedUser);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === currentUser.id ? { id: user.id, ...updatedUser } : user
        )
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  if (isCreating) {
    return <Create onClose={() => setIsCreating(false)} />;
  }

  if (isEditing && currentUser) {
    return (
      <form onSubmit={handleUpdate} className="w-full max-w-2xl p-10 mx-auto">
        <div className="mb-4">
          <label
            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            htmlFor="givenName"
          >
            Given Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
            id="givenName"
            type="text"
            defaultValue={currentUser.givenName}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            htmlFor="surname"
          >
            Surname
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
            id="surname"
            type="text"
            defaultValue={currentUser.surname}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            defaultValue={currentUser.email}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            htmlFor="contact"
          >
            Contact
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
            id="contact"
            type="text"
            defaultValue={currentUser.contact}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            htmlFor="personnelType"
          >
            Personnel Type
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
            id="personnelType"
            type="text"
            defaultValue={currentUser.personnelType}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            htmlFor="salary"
          >
            Salary
          </label>
          <select
            id="supervisor"
            value={supervisor}
            onChange={(e) => setSupervisor(e.target.value)}
            className="border border-gray-300 p-2 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            <option value="" disabled>
              Select supervisor
            </option>
            {supervisors.map((supervisor) => (
              <option key={supervisor.id} value={supervisor.email}>
                {supervisor.surname} {supervisor.givenName}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            htmlFor="salary"
          >
            Salary
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
            id="salary"
            type="text"
            defaultValue={currentUser.salary}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Save
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg overflow-hidden">
        <div className="flex justify-end p-4">
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setIsCreating(true)}
          >
            Create Account
          </button>
        </div>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Avatar
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Personnel Type
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Salary
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-200 dark:border-gray-800"
              >
                <td className="px-6 py-4">
                  <Avatar>
                    <AvatarImage alt="Avatar" src={user.imageUrl} />
                    <AvatarFallback>
                      {user.givenName[0] + user.surname[0]}
                    </AvatarFallback>
                  </Avatar>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-50">
                  {user.givenName} {user.surname}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-50">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-50">
                  {user.contact}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-50">
                  {user.personnelType}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-50">
                  {user.salary}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-50 flex space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
