import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { database } from "../../firebase/firebase"; // Adjust the import path as needed
import { ref, push, set, get } from "firebase/database";

const attributes = [
  {
    title: "Honesty and Integrity",
    progress: 0,
    description:
      "Displays and builds the highest standards of ethical and moral conduct in order to promote confidence and trust in Public Service, communicates values to others, monitors own actions for consistency with values and beliefs, does not divulge confidential information to unauthorized people, is open and honest and provides quality service without need for inducements.",
  },
  {
    title: "Professionalism",
    progress: 0,
    description:
      "Draws from own experience, knowledge and expertise to demonstrate good judgment and relates professional knowledge to work.",
  },
  {
    title: "Objectivity",
    progress: 0,
    description:
      "Makes a balanced assessment of all relevant circumstances, is impartial, honest, and unduly influenced by own interest or by others in forming judgments.",
  },
  {
    title: "Customer Service",
    progress: 0,
    description:
      "Treats all customers with respect, responds to customer needs within agreed time frames, addresses customer concerns and problem situations with patience and tact.",
  },
  {
    title: "Interpersonal / Social Skills",
    progress: 0,
    description:
      "Exhibits cordial relationship with Clients (internal/external) Commands respect and trust, Exhibits cordial relationship with supervisors.",
  },
  {
    title: "Communication",
    progress: 0,
    description:
      "Actively listens and speaks respectfully, exchanges information in a clear manner, expresses self clearly both orally and in writing, able to present issues in a convincing manner.",
  },
  {
    title: "Creativity and Innovation",
    progress: 0,
    description:
      "Provides practical solutions to problems, makes useful suggestions for improvements, forward thinking, keen to seek and grasp new opportunities and ideas.",
  },
  {
    title: "Time Management",
    progress: 0,
    description:
      "Adheres to schedules; Is effective in setting priorities; manages time well, completes work assignment on time.",
  },
  {
    title: "People Management and Empathy",
    progress: 0,
    description:
      "Manages and respects diversity, respects divergent views irrespective of the source, engages others to develop commitment, appreciates other’s efforts and puts self in the position of others.",
  },
  {
    title: "Leadership",
    progress: 0,
    description:
      "Keeps people informed, models and encourages personal accountability, develops others, champions new ideas, reinforces and communicates a compelling vision for change.",
  },
  {
    title: "Team Work",
    progress: 0,
    description:
      "Works cooperatively and collaboratively; builds strong teams, shares resources and develops processes to improve the efficiency of the team, listens and respects others and does his/her share of work.",
  },
];

export default function Goals({ email }) {

  const [goals, setGoals] = useState([])
  const [key, setKey] = useState("");
  const [yourSummary, setYourSummary] = useState(null)
  const [currentGoal, setCurrentGoal] = useState("")
  const [comments, setComments] = useState(""); // State for comments
  const [currentQuarter, setCurrentQuarter] = useState(
    calculateCurrentQuarter()
  );
  const [isSubmitted, setIsSubmitted] = useState(false); // State to check if the form is already submitted
  const [successMessage, setSuccessMessage] = useState(""); // State for success message

  useEffect(() => {
    const checkExistingGoals = async () => {
      const sanitizedEmail = sanitizeEmail(email);
      const quarterString = `${currentQuarter} quarter`;
      const encodedQuarterString = encodeURIComponent(quarterString);
      const appraisalRef = ref(
        database,
        `EmployeeGoals/${encodedQuarterString}-${sanitizedEmail}`
      );

      try {
        const snapshot = await get(appraisalRef);
        if (snapshot.exists()) {
          console.log(snapshot)
          let data = snapshot.val()[Object.keys(snapshot.val())[0]];
          setYourSummary()
          setComments(data.comments)
          let im_arr = new Array()
          let ct = 0;
          data.goals.forEach(att => {
            att.index = ct;
            ct++;
          })
          setGoals(data.goals)
          setYourSummary(data)
          setKey(Object.keys(snapshot.val())[0])
          setIsSubmitted(true); // If data exists, set the form as submitted
        }
      } catch (error) {
        console.error("Error checking existing appraisal:", error);
      }
    };

    checkExistingGoals();
  }, [email, currentQuarter]);

  const handleGoalChange = (index, value) => {
    setGoals((prevPlans) => {
      const newPlans = [...prevPlans];
      newPlans[index] = value;
      return newPlans;
    });
  };

  const handleGoal = (value) => {
    setCurrentGoal(value)
  }

  const addGoal = () => {
    if (currentGoal.length > 0) {
      let gx = goals;
      gx[gx.length] = { goal: currentGoal, index: gx.length }
      setGoals(gx)
      setCurrentGoal("")
    }
  }

  const handleProgress = async (index, value) => {
    const sanitizedEmail = sanitizeEmail(email);
    const quarterString = `${currentQuarter} quarter`; // Construct quarter string
    const encodedQuarterString = encodeURIComponent(quarterString);
    const goalsRef = ref(
      database,
      `EmployeeGoals/${encodedQuarterString}-${sanitizedEmail}/${key}/goals/${index}/progress`
    );

    await set(goalsRef, value).then(() => {
      setGoals((prevValues) => {
        const newValues = [...prevValues];
        newValues[index].progress = value;
        return newValues;
      })
      console.log("Goal Update Complete")
    }).catch((error) => {
      console.error("Error saving data:", error);
    })

  }

  const sanitizeEmail = (email) => {
    return email.replace(/[.#$[\]]/g, "_");
  };

  const handleSubmit = async () => {
    const sanitizedEmail = sanitizeEmail(email);
    const quarterString = `${currentQuarter} quarter`; // Construct quarter string

    try {
      const encodedQuarterString = encodeURIComponent(quarterString);
      const supervisorAppraisalRef = ref(
        database,
        `EmployeeGoals/${encodedQuarterString}-${sanitizedEmail}`
      );
      const newDataRef = push(supervisorAppraisalRef);

      const dataToSave = {
        email,
        goals: goals.map((goal) => ({
          goal: goal.goal,
          progress: 0
        })),
        comments,
      };

      await set(newDataRef, dataToSave)
        .then(() => {
          console.log("Data saved successfully!");
          //onSubmit(email); // Notify parent component of submission
          setIsSubmitted(true)
          setSuccessMessage("Data submitted successfully!"); // Set success message
        })
        .catch((error) => {
          console.error("Error saving data:", error);
        });
    } catch (error) {
      console.error("Error creating path:", error);
      // Handle the error (e.g., display an error message to the user)
    }
  };

  // Function to determine the current quarter (implementation depends on your needs)
  function calculateCurrentQuarter() {
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
  }

  return (
    <div className="border rounded-lg w-full max-w-3xl mx-auto p-10 p-10 bg-white">
      <h3 style={{ fontSize: '24pt', fontWeight: '600' }}>Your Quarterly Targets</h3>
      <h6>{"For: Quater " + calculateCurrentQuarter()}</h6>
      {isSubmitted && (
        <div className="mt-4">
          <h4 className="text-red-500 font-bold">You have already submitted your targets for this quarter.</h4>
          <p>Please note that you can only start updating a target's progress once it's status is marked as approved by your supervisor</p>
        </div>
      )}
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70%]">Targets</TableHead>
              <TableHead className="w-[30%]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.map((goal) => (
              <TableRow key={goal.index}>
                <TableCell>
                  <p>
                    <span style={{ marginRight: '32px', background: '#1e90ff', fontSize: '14pt', fontWeight: '600', color: '#fff', padding: '8px' }}>{goal.index + 1}</span>
                    {goal.goal}
                  </p>
                  {goal.approved && (
                    <div>
                      <p>Progress: <input type="range" style={{ marginLeft: '24px', padding: 0, marginTop: '24px' }} max={100} value={goal.progress} onChange={(e) => handleProgress(goal.index, e.target.value)} disabled={!goal.approved}></input>
                      <span style={{ marginLeft: '32px', background: '#1e90ff', fontSize: '14pt', fontWeight: '500', color: '#fff', padding: '8px' }}>{goal.progress+"%"}</span>
                      </p>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {isSubmitted ?
                    <label style={{ color: goal.approved ? '#00cc00' : '#eb144c' }}>{goal.approved ? 'Approved' : 'Pending Approval'}</label> :
                    <label >N/A</label>
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!isSubmitted && (
          <div>
            <Textarea
              className="w-full"
              placeholder="Enter your goal. Be as brief but ellaborate as possible."
              value={currentGoal}
              onChange={(e) =>
                handleGoal(e.target.value)
              }
            />
            <Button onClick={addGoal} style={{ marginTop: '16px' }}>Add Goal</Button>
          </div>
        )}
        <div className="mt-4">
          <Label htmlFor="comments" className="block mb-2 font-bold">
            Any other comments you would like to submit together with this document?
          </Label>
          <Textarea
            id="comments"
            className="w-full"
            placeholder="Enter your comments here..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            disabled={isSubmitted}
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button
            className="bg-green-500 text-white"
            onClick={handleSubmit}
            disabled={isSubmitted}
          >
            Submit
          </Button>
        </div>
        {successMessage && (
          <div className="mt-4 text-green-500 font-bold">{successMessage}</div>
        )}
      </div>
    </div>
  );
}