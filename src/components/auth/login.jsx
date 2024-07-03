import { useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getDatabase,
  ref,
  query,
  orderByChild,
  equalTo,
  get,
} from "firebase/database";
import { useNavigate } from "react-router-dom";
import logo from "../images/Logo.png";
import image1 from "../images/image1.jpg"; // Ensure this path is correct

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(null);
  const [showIcon, setShowIcon] = useState({icon: "./eye.svg", type: "password"})
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get the idToken (optional)
      const idToken = await user.getIdToken();
      localStorage.setItem("idToken", idToken);

      //console.log(idToken)

      // Fetch user data from the Realtime Database
      const db = getDatabase();
      const dbRef = ref(db, "users");
      const userQuery = query(dbRef, orderByChild("email"), equalTo(email));
      const snapshot = await get(userQuery);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        const userId = Object.keys(userData)[0];
        const personnelType = userData[userId].personnelType;

        setLoginSuccess("Login successful!");
        setLoginError(null);

        switch (personnelType) {
          case "supervisor":
            navigate("/supervisor/landing");
            break;
          case "employee":
            navigate("/employee/landing");
            break;
          case "administrator":
            navigate("/admin/landing");
            break;
          case "director":
            navigate("/HR/landing");
            break;
          default:
            setLoginError("Invalid personnel type");
            setLoginSuccess(null);
        }
      } else {
        setLoginError("Invalid login credentials");
        setLoginSuccess(null);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setLoginError("Invalid login credentials");
      setLoginSuccess(null);
    }
  };

  const handlePView = () =>{
    if(showIcon.type == "password"){
      setShowIcon({icon: "./eye-off.svg", type: "text"})
    }else{
      setShowIcon({icon: "./eye.svg", type: "password"})
    }
  }

  const handlePasswordReset = async () => {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess("Password reset email sent successfully!");
      setResetError(null);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setResetError(error.message);
      setResetSuccess(null);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${image1})` }}
    >
      <div className="bg-white bg-opacity-80 p-6 rounded-lg shadow-md max-w-sm w-full mx-auto">
        <div className="space-y-2 text-center">
          <img src={logo} alt="Logo" className="mx-auto h-12 w-24" />
          <p className="text-gray-700">
            Enter your email and password to login to your account
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setResetEmail(email)}
                className="text-sm font-medium text-gray-800 hover:underline"
              >
                Forgot your password?
              </button>
            </div>
            <input
              id="password"
              type={showIcon.type}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              required
            />
            <img onClick={handlePView} style={{ maxWidth: '32px', float: "right", marginTop: "-35px", marginRight: '16px', position: "relative", zIndex: 10 }} src={showIcon.icon} ></img>
          </div>
          {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
          {loginSuccess && (
            <p className="text-green-500 text-sm">{loginSuccess}</p>
          )}
          <button
            type="submit"
            onClick={handleLogin}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Login
          </button>
        </div>
        {resetEmail && (
          <div className="mt-4 space-y-4">
            <label
              htmlFor="resetEmail"
              className="block text-sm font-medium text-gray-700"
            >
              Enter your email to reset password
            </label>
            <input
              id="resetEmail"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              required
            />
            <button
              type="button"
              onClick={handlePasswordReset}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset Password
            </button>
            {resetError && <p className="text-red-500 text-sm">{resetError}</p>}
            {resetSuccess && (
              <p className="text-green-500 text-sm">{resetSuccess}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
