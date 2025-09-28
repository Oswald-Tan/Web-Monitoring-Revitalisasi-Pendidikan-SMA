import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { LoginUser, reset } from "../../features/authSlice";
import { FaLongArrowAltRight } from "react-icons/fa";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { HiMiniUser, HiLockClosed } from "react-icons/hi2";
import { getDashboardPathByRole } from "../../utils/roleRoutes";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false,
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isSuccess, isLoading, error } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (user || isSuccess) {
      const path = getDashboardPathByRole(user?.role);
      navigate(path);
    }

    return () => {
      dispatch(reset());
    };
  }, [user, isSuccess, dispatch, navigate]);

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  const Auth = async (e) => {
    e.preventDefault();
    dispatch(LoginUser({ email, password }));
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-md w-full m-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-br from-amber-600 to-amber-900 py-8 px-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-amber-100">Revitalisasi Infrastruktur Pendidikan</p>
        </div>

        <div className="py-10 px-6 sm:px-10">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Sign in to continue to your account
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={Auth} className="space-y-6">
            <div className="relative">
              <label
                htmlFor="email"
                className={`absolute transition-all duration-200 ${
                  isFocused.email || email
                    ? "top-1 text-xs text-amber-600"
                    : "top-3.5 text-gray-500"
                }`}
              >
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => handleFocus("email")}
                  onBlur={() => handleBlur("email")}
                  required
                  className="w-full pt-5 pb-2 text-sm border-0 border-b-2 border-gray-300 focus:border-amber-600 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className={`absolute transition-all duration-200 ${
                  isFocused.password || password
                    ? "top-1 text-xs text-amber-600"
                    : "top-3.5 text-gray-500"
                }`}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => handleFocus("password")}
                  onBlur={() => handleBlur("password")}
                  required
                  className="w-full pt-5 pb-2 text-sm border-0 border-b-2 border-gray-300 focus:border-amber-600 focus:outline-none focus:ring-0"
                />

                <span
                  className="text-gray-400 absolute top-5 right-4 cursor-pointer hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <HiEyeOff /> : <HiEye />}
                </span>
              </div>
            </div>

            {/* <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link
                  to="/forgot/password"
                  className="font-medium text-amber-600 hover:text-amber-500"
                >
                  Forgot password?
                </Link>
              </div>
            </div> */}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading
                    ? "bg-amber-400"
                    : "bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                } transition-colors duration-300`}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : null}
                {isLoading ? "Authenticating..." : "Sign In"}
                {!isLoading && <FaLongArrowAltRight size={16} />}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-gray-50 py-6 px-6 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Dashboard Revitalisasi Pendidikan
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
