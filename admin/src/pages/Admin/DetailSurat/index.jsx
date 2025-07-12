import Layout from "./Layout";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../../features/authSlice";


const DetailSurat = () => {
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
    if (user && user.role !== "admin_jurusan") {
      navigate("/dashboard/admin/jurursan");
    }
  }, [isError, user, navigate]);

  return (
    <div>
      <Layout />
    </div>
  );
};

export default DetailSurat;
