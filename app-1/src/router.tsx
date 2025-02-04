import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./home";
import { Patient } from "./compositions";

// Main router component
export const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/patient/:id" element={<Patient />} />
      </Routes>
    </Router>
  );
};
