import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./Layout/LandingPage";
import NotFoundPage from "./pages/404";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  )
}

export default App;