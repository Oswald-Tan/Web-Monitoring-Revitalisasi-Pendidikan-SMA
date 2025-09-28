import Layout from "./Layout"
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../../features/authSlice";
import { getDashboardPathByRole } from "../../../utils/roleRoutes";

const TimeScheduleInputAdminPusat = () => {
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
     if (user && user.role !== "admin_pusat") {
       navigate(getDashboardPathByRole(user.role));
     }
   }, [isError, user, navigate]);

  return (
    <div><Layout /></div>
  )
}

export default TimeScheduleInputAdminPusat