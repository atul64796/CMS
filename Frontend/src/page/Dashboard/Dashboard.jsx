import { useAuth } from "../../context/AuthContext.jsx";
import StudentPanel from "../Students/StudentPanel.jsx";
import TeacherPanel from "../Teachers/TeacherPanel.jsx";
import AdminPanel from "../Admin/AdminPanel.jsx";

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return <p>Loading...</p>;

  if (user.role === "student") {
    return <StudentPanel />;
  }

  if (user.role === "teacher") {
    return <TeacherPanel />;
  }

  if (user.role === "admin") {
    return <AdminPanel/>;
  }

  return <p>No panel found</p>;
};

export default Dashboard;