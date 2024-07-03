import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CardContent, Card } from "@/components/ui/card";
import { encodeEmail } from "../../utils"; // Import the utility function
import { Button } from "@/components/ui/button";


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

function EmployeeCard({ key, user, click1, click2 }) {
  const navigate = useNavigate();

  const handleClick = () => {
    const encodedEmail = encodeEmail(user.email);
    console.log(user.id)
    if (user.report == 2) {
      if (user.bonus || user.dismiss) {
        if (user.bonus) {
          navigate(`/appraisal/${encodedEmail + "+" + user.salary + "+" + user.id + "+bonus" + "+" + user.comment}`);
        } else if (user.dismiss) {
          navigate(`/appraisal/${encodedEmail + "+" + user.salary + "+" + user.id + "+dismiss" + "+" + user.comment}`);
        }
      } else {
        navigate(`/appraisal/${encodedEmail + "+" + user.salary + "+" + user.id}`);
      }
    } else {
      navigate(`/appraisal/${encodedEmail + "+" + user.id}`);
    }
  };

  return (
    <Card
      className="w-full max-w-md transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
    >
      <CardContent className="flex items-center gap-4 p-2">
        <Avatar>
          <AvatarImage
            alt={`${user.givenName} ${user.surname}`}
            src={user.imageUrl || "/placeholder-avatar.jpg"}
          />
          <AvatarFallback>{user.givenName[0] + user.surname[0]}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h4 className="text-lg font-semibold">
            {user.givenName} {user.surname}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user.personnelType}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <MailboxIcon className="h-4 w-4" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <PhoneIcon className="h-4 w-4" />
            <span>{user.contact}</span>
          </div>
          {
            user.personnelType == "supervisor" && (
              <div style={{ display: 'flex' }}>
                <Button onClick={() => {
                  click1(user.email, user.givenName + " " + user.surname)
                }} style={{ marginTop: '16px', marginRight: '16px' }} disabled={user.appraised}>{user.appraised ? "Appraised" : "Appraise"}</Button>
                <Button onClick={() => {
                  click2(user.email, user.givenName + " " + user.surname)
                }} style={{ marginTop: '16px'}}>Targets</Button>
              </div>
            )
          }
          <Button onClick={handleClick} style={{ marginTop: '16px' }}>View Reports</Button>
        </div>
        <div className="ml-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
          <span className="text-sm font-semibold">
            {parseFloat(user.appraisalScore).toFixed(1)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default EmployeeCard;
