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
    description:
      "Displays and builds the highest standards of ethical and moral conduct in order to promote confidence and trust in Public Service, communicates values to others, monitors own actions for consistency with values and beliefs, does not divulge confidential information to unauthorized people, is open and honest and provides quality service without need for inducements.",
  },
  {
    title: "Professionalism",
    description:
      "Draws from own experience, knowledge and expertise to demonstrate good judgment and relates professional knowledge to work.",
  },
  {
    title: "Objectivity",
    description:
      "Makes a balanced assessment of all relevant circumstances, is impartial, honest, and unduly influenced by own interest or by others in forming judgments.",
  },
  {
    title: "Customer Service",
    description:
      "Treats all customers with respect, responds to customer needs within agreed time frames, addresses customer concerns and problem situations with patience and tact.",
  },
  {
    title: "Interpersonal / Social Skills",
    description:
      "Exhibits cordial relationship with Clients (internal/external) Commands respect and trust, Exhibits cordial relationship with supervisors.",
  },
  {
    title: "Communication",
    description:
      "Actively listens and speaks respectfully, exchanges information in a clear manner, expresses self clearly both orally and in writing, able to present issues in a convincing manner.",
  },
  {
    title: "Creativity and Innovation",
    description:
      "Provides practical solutions to problems, makes useful suggestions for improvements, forward thinking, keen to seek and grasp new opportunities and ideas.",
  },
  {
    title: "Time Management",
    description:
      "Adheres to schedules; Is effective in setting priorities; manages time well, completes work assignment on time.",
  },
  {
    title: "People Management and Empathy",
    description:
      "Manages and respects diversity, respects divergent views irrespective of the source, engages others to develop commitment, appreciates other’s efforts and puts self in the position of others.",
  },
  {
    title: "Leadership",
    description:
      "Keeps people informed, models and encourages personal accountability, develops others, champions new ideas, reinforces and communicates a compelling vision for change.",
  },
  {
    title: "Team Work",
    description:
      "Works cooperatively and collaboratively; builds strong teams, shares resources and develops processes to improve the efficiency of the team, listens and respects others and does his/her share of work.",
  },
];

export default function SupeTable({ email }) {
  const [selectedValues, setSelectedValues] = useState(
    attributes.map(() => null) // Initialize with null values for each attribute
  );
  const [improvementPlans, setImprovementPlans] = useState(
    attributes.map(() => "") // Initialize with empty strings for each attribute
  );
  const [yourSummary, setYourSummary] = useState(null)
  const [comments, setComments] = useState(""); // State for comments
  const [currentQuarter, setCurrentQuarter] = useState(
    calculateCurrentQuarter()
  );
  const [isSubmitted, setIsSubmitted] = useState(false); // State to check if the form is already submitted
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  let loaded = 0
  useEffect(() => {
    const checkExistingAppraisal = async () => {
      if (loaded == 0) {
        const sanitizedEmail = sanitizeEmail(email);
        const quarterString = `${currentQuarter} quarter`;
        const encodedQuarterString = encodeURIComponent(quarterString);
        const appraisalRef = ref(
          database,
          `EmployeeAppraisal/${encodedQuarterString}-${sanitizedEmail}`
        );

        try {
          const snapshot = await get(appraisalRef);
          if (snapshot.exists()) {
            loaded = 1;
            console.log(snapshot.val())
            setYourSummary(snapshot.val()[Object.keys(snapshot.val())[0]])
            setComments(yourSummary.comments)
            setOverallValue(yourSummary.overallValue)
            let val_arr = new Array()
            let im_arr = new Array()
            yourSummary.attributes.forEach(att => {
              val_arr[val_arr.length] = att.performanceLevel
              im_arr[im_arr.length] = att.improvementPlan
            })
            setSelectedValues(val_arr)
            setIsSubmitted(true); // If data exists, set the form as submitted
          }
        } catch (error) {
          console.error("Error checking existing appraisal:", error);
        }
      }
    };

    checkExistingAppraisal();
  }, [email, currentQuarter, yourSummary, comments, selectedValues, isSubmitted]);

  const handleRadioChange = (index, value) => {
    setSelectedValues((prevValues) => {
      const newValues = [...prevValues];
      newValues[index] = value;
      return newValues;
    });
  };

  const handleImprovementPlanChange = (index, value) => {
    setImprovementPlans((prevPlans) => {
      const newPlans = [...prevPlans];
      newPlans[index] = value;
      return newPlans;
    });
  };

  const calculateOverallValue = () => {
    const totalSelected = selectedValues
      .filter((value) => value !== null)
      .reduce((acc, val) => acc + parseInt(val), 0);
    const overallValue = (totalSelected / (5 * attributes.length)) * 70;
    return overallValue.toFixed(2); // Format to two decimal places
  };

  const [overallValue, setOverallValue] = useState(calculateOverallValue());

  useEffect(() => {
    setOverallValue(calculateOverallValue());
  }, [selectedValues]);

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
        `EmployeeAppraisal/${encodedQuarterString}-${sanitizedEmail}`
      );
      const newDataRef = push(supervisorAppraisalRef);

      const dataToSave = {
        email,
        attributes: attributes.map((attribute, index) => ({
          title: attribute.title,
          description: attribute.description,
          performanceLevel: selectedValues[index],
          improvementPlan: improvementPlans[index],
        })),
        overallValue: calculateOverallValue(),
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
    <div className="border rounded-lg w-full p-10 bg-white">
      {isSubmitted && (
        <div className="mt-4 text-red-500 font-bold">
          You have already submitted your appraisal for this quarter.
        </div>
      )}
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Attributes</TableHead>
              <TableHead className="w-[20%]">Performance level</TableHead>
              <TableHead className="w-[40%]">Improvement Plan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributes.map((attribute, index) => (
              <TableRow key={index}>
                <TableCell>
                  <b>{attribute.title}</b>
                  <br />
                  {attribute.description}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div
                        key={`${index}-${value}`}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="radio"
                          id={`performance-${index}-${value}`}
                          name={`performance-${index}`}
                          value={value.toString()}
                          className="text-green-500"
                          checked={selectedValues[index] === value}
                          onChange={() => handleRadioChange(index, value)}
                          disabled={isSubmitted}
                        />
                        <Label htmlFor={`performance-${index}-${value}`}>
                          {value}
                        </Label>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Textarea type="text"
                    className="w-full"
                    placeholder="Enter your improvement plan here..."
                    onChange={(e) => { handleImprovementPlanChange(index, e.target.value) }}
                    value={improvementPlans[index]} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
          <span className="text-gray-500 font-bold">Overall Value:</span>
          <span className="ml-2 text-lg font-bold">{overallValue}</span>
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
