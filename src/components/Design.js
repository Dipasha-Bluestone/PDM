import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InputDesign from "C:/Users/sw3/source/repos/PDM/client/src/components/InputDesign";
import EditDesign from "C:/Users/sw3/source/repos/PDM/client/src/components/Edit Design";
import DeleteDesign from "C:/Users/sw3/source/repos/PDM/client/src/components/DeleteDesign";

const Design = () => {
    const [designs, setDesigns] = useState([]);
    const [editDesignNumber, setEditDesignNumber] = useState(null);
    const [deleteDesignNumber, setDeleteDesignNumber] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    // Fetch all designs from the backend
    useEffect(() => {
        const fetchDesigns = async () => {
            try {
                const response = await fetch("http://localhost:5000/designs");
                const data = await response.json();
                console.log("Fetched Designs:", data); // Debugging
                if (Array.isArray(data)) {
                    setDesigns(data);
                } else {
                    console.error("Expected an array but got:", data);
                    setDesigns([]); // Fallback to empty array
                }
            } catch (err) {
                console.error("Error fetching designs:", err.message);
                setDesigns([]); // Prevents undefined state
            }
        };
        fetchDesigns();
    }, []);


    return (
        <div className="container">
            <h1 className="text-center mt-4">PDM Designs</h1>

            {/* Add New Design */}
            <InputDesign onDesignAdded={() => window.location.reload()} />

            {/* Table of Designs */}
            <table className="design-table">
                <thead>
                    <tr>
                        <th>Design No.</th>
                        <th>Image</th>
                        <th>Category</th>
                        <th>Product Type</th>
                        <th>Price</th>
                        <th>Design Dimensions</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {designs.map((design) => (
                        <tr key={design.design_number}>
                            <td>{design.design_number}</td>
                            <td>
                                {design.design_image ? (
                                    <img
                                        src={design.design_image}
                                        alt="Design"
                                        style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                    />
                                ) : (
                                    "No Image"
                                )}
                            </td>
                            <td>{design.category}</td>
                            <td>{design.product_type}</td>
                            <td>${design.price}</td>
                            <td>{design.design_dimensions}</td>
                            <td>{design.description}</td>
                            <td>
                                <button onClick={() => setEditDesignNumber(design.design_number)} className="btn-edit">
                                    Edit
                                </button>
                                <button onClick={() => setDeleteDesignNumber(design.design_number)} className="btn-delete">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Show EditDesign when edit button is clicked */}
            {editDesignNumber && (
                <div className="modal-container">
                    <EditDesign
                        design_number={editDesignNumber}
                        onUpdate={() => {
                            setEditDesignNumber(null);
                            window.location.reload();
                        }}
                    />
                    <button onClick={() => setEditDesignNumber(null)}>Cancel</button>
                </div>
            )}

            {/* Show DeleteDesign when delete button is clicked */}
            {deleteDesignNumber && (
                <div className="modal-container">
                    <DeleteDesign
                        design_number={deleteDesignNumber}
                        onDelete={() => {
                            setDeleteDesignNumber(null);
                            window.location.reload();
                        }}
                    />
                    <button onClick={() => setDeleteDesignNumber(null)}>Cancel</button>
                </div>
            )}

            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Design;
