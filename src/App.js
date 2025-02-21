import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Register from "C:/Users/sw3/source/repos/PDM/client/src/components/Register";
import Login from "C:/Users/sw3/source/repos/PDM/client/src/components/Login";
import Design from "C:/Users/sw3/source/repos/PDM/client/src/components/Design";

const App = () => {
    const isAuthenticated = !!localStorage.getItem("token");

    return (
        <Router>
            <Routes>
                <Route path="/" element={isAuthenticated ? <Navigate to="/designs" /> : <Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/designs" element={isAuthenticated ? <Design /> : <Navigate to="/login" />} />
            </Routes>
        </Router>
    );
};

export default App;

 