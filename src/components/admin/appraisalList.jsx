import { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { database } from "../../firebase/firebase"; // Adjust the import path as needed
import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";

export default function AppraisalList() {
  const [appraisals, setAppraisals] = useState([]);

  useEffect(() => {
    const appraisalsRef = ref(database, "EmployeeAppraisal");

    const fetchData = async () => {
      try {
        onValue(appraisalsRef, (snapshot) => {
          const appraisalsData = snapshot.val();
          if (appraisalsData) {
            const appraisalsArray = Object.keys(appraisalsData).map((key) => ({
              id: key,
              ...appraisalsData[key],
            }));
            setAppraisals(appraisalsArray);
          } else {
            setAppraisals([]);
          }
        });
      } catch (error) {
        console.error("Error fetching appraisals:", error);
      }
    };

    fetchData();

    return () => {
      off(appraisalsRef);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              {attributes.map((attribute, index) => (
                <TableHead key={index}>{attribute.title}</TableHead>
              ))}
              <TableHead>Overall Value</TableHead>
              <TableHead>Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appraisals.map((appraisal) => (
              <TableRow key={appraisal.id}>
                <TableCell>{appraisal.email}</TableCell>
                {(appraisal.attributes || []).map((attribute, index) => (
                  <TableCell key={index}>
                    {attribute.performanceLevel || "N/A"}
                  </TableCell>
                ))}
                <TableCell>{appraisal.overallValue}</TableCell>
                <TableCell>{appraisal.comments}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Assuming the same attributes array used in the Appraisal component
const attributes = [
  {
    title: "Key Outputs",
    description: "",
  },
  {
    title: "Performance Indicators",
    description: "(How will results be measured)",
  },
  {
    title: "Performance Targets",
    description: "(An agreed minimum level of performance)",
  },
  {
    title: "Appraisee's Rating",
    description: "(Self-rating)",
  },
  {
    title: "Appraiser's rating",
    description: "",
  },
  {
    title: "Agreed Performance Level",
    description: "",
  },
];
