import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  database,
  ref,
  onValue,
  off,
  get,
  query,
  orderByChild,
  equalTo,
} from "../../firebase/firebase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CardContent, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TestTable from "./testTable";
import GoalsView from "./goalv";
import UserReport from "./userReport";

function MailboxIcon(props) {
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
      <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z" />
      <polyline points="15,9 18,9 18,11" />
      <path d="M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2v0" />
      <line x1="6" x2="7" y1="10" y2="10" />
    </svg>
  );
}

function PhoneIcon(props) {
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
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ContactCard({ user, onAppraiseClick, onGoalClick, onReportsClick }) {
  return (
    <Card
      className="w-full max-w-sm">
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage
              alt={`${user.givenName} ${user.surname}`}
              src={user.imageUrl || "/placeholder-avatar.jpg"}
            />
            <AvatarFallback>
              {user.givenName[0] + user.surname[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="text-lg font-semibold truncate">
              {user.givenName} {user.surname}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user.personnelType}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 truncate">
          <MailboxIcon className="h-4 w-4" />
          <span>{user.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 truncate">
          <PhoneIcon className="h-4 w-4" />
          <span>{user.contact}</span>
        </div>
        <Button onClick={() => onGoalClick(user.email, user.givenName + " " + user.surname)}
        >Goals & Progress</Button>
        <div style={{ display: 'flex' }}>
          <Button onClick={() => onReportsClick(user.email, user.givenName + " " + user.surname)}>Reports</Button>
          <Button
            className={`text-white ${user.appraised ? "bg-green-500" : "bg-gray-800"
              }`} style={{ marginLeft: '16px' }} onClick={() => onAppraiseClick(user.email, user.givenName + " " + user.surname)}
          >
            {user.appraised == 1 ? "Appraised" : "Appraise"}
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}

let f1 = 0;
let f2 = 0;
export default function ContactCardList() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedEmail2, setSelectedEmail2] = useState(null);
  const [selectedEmail3, setSelectedEmail3] = useState(null);
  const [selectedName, setSelectedName] = useState(null);

  useEffect(() => {
    if (f1 == 0) {
      const fetchCurrentUser = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          try {
            const token = await currentUser.getIdToken();

            const userQuery = query(
              ref(database, "users"),
              orderByChild("email"),
              equalTo(currentUser.email)
            );

            const snapshot = await get(userQuery);
            //console.log("User ID Token:", token);
            if (snapshot.exists()) {
              setCurrentUser(snapshot.val()[Object.keys(snapshot.val())[0]]);
              //Now get users under supervisor
              const userQuery = query(
                ref(database, "users"),
                orderByChild("supervisor"),
                equalTo(currentUser.email)
              );
              const snapshot2 = await get(userQuery);
              const usersData = snapshot2.val();
              //console.log(usersData);
              if (usersData && currentUser) {
                const usersArray = Object.keys(usersData)
                  .map((key) => ({
                    id: key,
                    ...usersData[key],
                  }))
                  .filter(
                    (user) =>
                      user.personnelType === "employee" &&
                      user.supervisor === currentUser.email
                  );

                //console.log(usersArray)

                // Check if each user has been appraisedcourse
                const updatedUsers = await Promise.all(
                  usersArray.map(async (user) => {
                    const sanitizedEmail = sanitizeEmail(user.email);
                    const quarterString = `${calculateCurrentQuarter()} quarter`;
                    const encodedQuarterString = encodeURIComponent(quarterString);
                    const appraisalRef = ref(
                      database,
                      `SupervisorAppraisal/${encodedQuarterString}-${sanitizedEmail}`
                    );

                    try {
                      const snapshot3 = await get(appraisalRef);
                      return {
                        ...user,
                        appraised: snapshot3.exists(), // Set the appraised flag
                      };
                    } catch (error) {
                      console.error("Error checking existing appraisal:", error);
                      return {
                        ...user,
                        appraised: false,
                      };
                    }
                  })
                );
                setUsers(updatedUsers);
              }
            }
          } catch (error) {
            console.error("Error fetching current user profile:", error);
          }
        }
      }

      if (f1 == 0) {
        f1 = 1
        fetchCurrentUser()
      }
    }
  }, [currentUser]);

  const sanitizeEmail = (email) => {
    return email.replace(/[.#$[\]]/g, "_");
  };

  const calculateCurrentQuarter = () => {
    const today = new Date();
    const month = today.getMonth(); // 0-indexed

    switch (true) {
      case month < 3:
        return 1; // Q1 (January - March)
      case month < 6:
        return 2; // Q2 (April - June)
      case month < 9:
        return 3; // Q3 (July - September)
      default:
        return 4; // Q4 (October - December)
    }
  };

  const handleAppraiseClick = (email, name) => {
    setSelectedEmail(email);
    setSelectedName(name);
  };

  const handleProgressClick = (email, name) => {
    setSelectedEmail2(email)
    setSelectedName(name)
  }

  const handleReportsClick = (email, name) => {
    setSelectedEmail3(email)
    setSelectedName(name)
  }

  const handleAppraiseSubmit = (email) => {
    //console.log(email)
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.email === email ? { ...user, appraised: true } : user
      )
    );
    setSelectedEmail(null);
    setSelectedName(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {selectedEmail && (
        <TestTable email={selectedEmail} name={selectedName} onSubmit={handleAppraiseSubmit} goBack={() => {
          setSelectedEmail(null)
        }} />
      )}
      {selectedEmail2 && (
        <GoalsView email={selectedEmail2} name={selectedName} goBack={() => {
          setSelectedEmail2(null)
        }}></GoalsView>
      )}
      {selectedEmail3 && (
        <UserReport email={selectedEmail3} name={selectedName} goBack={() => {
          setSelectedEmail3(null)
        }}></UserReport>
      )}
      {!(selectedEmail || selectedEmail2 || selectedEmail3) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {users.map((user) => (
            <ContactCard
              key={user.id}
              user={user}
              onAppraiseClick={handleAppraiseClick}
              onGoalClick={handleProgressClick}
              onReportsClick={handleReportsClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
