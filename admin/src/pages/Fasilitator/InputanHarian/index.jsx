import Layout from "./Layout";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../../features/authSlice";
import { getDashboardPathByRole } from "../../../utils/roleRoutes";

const InputHarianFasilitator = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isError, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      navigate("/");
    }
    if (user && user.role !== "fasilitator") {
      navigate(getDashboardPathByRole(user.role));
    }
  }, [isError, user, navigate]);

  return (
    <div>
      <Layout />
    </div>
  );
};

export default InputHarianFasilitator;
