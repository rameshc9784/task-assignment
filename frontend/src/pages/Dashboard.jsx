import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUser } from "react-icons/fa";
import { CiLogin } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [showAddAgent, setShowAddAgent] = useState(false);
    const [agentData, setAgentData] = useState({ name: "", email: "", countryCode: "+1", mobile: "", password: "" });
    const [agents, setAgents] = useState([]); // Store agents data
    const [token, setToken] = useState(localStorage.getItem("token"));
    const navigate = useNavigate();

    const email = localStorage.getItem("email")

    useEffect(() => {
        if (!token) {
            navigate("/login"); // Redirect if no token found
        } else {
            fetchAgents();
        }
    }, [token, navigate]); // Runs when token changes

    // Fetch all agents
    const fetchAgents = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/agents/all-agents`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAgents(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch agents");
        }
    };

    // Handle form input change
    const handleInputChange = (e) => {
        setAgentData({ ...agentData, [e.target.name]: e.target.value });
    };

    // Handle Add Agent form submission
    const handleAddAgentSubmit = async () => {
        if (!agentData.name || !agentData.email || !agentData.mobile || !agentData.password) {
            toast.error("All fields are required!");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/agents/add-agent`, agentData, {
                eaders: { Authorization: `Bearer ${token}` },
            });

            toast.success("Agent added successfully!");
            setShowAddAgent(false);
            setAgentData({ name: "", email: "", mobile: "", password: "" });
            fetchAgents(); // Refresh agent list
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add agent");
        }
    };

    // Handle Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
        toast.success("Logged out successfully!");
        navigate("/login");
    };

    if (!token) {
        return null; // Prevent component from rendering if not authenticated
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border border-gray-200 py-1">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <FaUser className="h-5 w-5" />
                        <span className="font-medium">{email}</span>
                    </div>
                    <button className="flex px-4 py-2 items-center gap-2 hover:bg-blue-100 rounded-lg font-bold cursor-pointer" onClick={handleLogout}>
                        <CiLogin className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </nav>

            {/* Agent Management */}
            <div className="bg-white mx-24 my-8 py-4 rounded-xl border border-gray-200">
                <div className="px-4 py-3">
                    <div className="flex justify-between items-center">
                        <p className="text-2xl font-bold">Agent Management</p>
                        <button onClick={() => setShowAddAgent(true)} className="bg-blue-500 text-white px-4 py-1.5 rounded-lg cursor-pointer">
                            Add Agent
                        </button>
                    </div>

                    {/* Agents List */}
                    <div className="mt-4">
                        <table className="w-full border border-gray-300 shadow-md rounded-lg">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-3 text-left">Name</th>
                                    <th className="p-3 text-left">Email</th>
                                    <th className="p-3 text-left">Mobile</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agents.length > 0 ? (
                                    agents.map((agent, index) => (
                                        <tr key={index} className="border-t border-gray-300 hover:bg-gray-100">
                                            <td className="p-3">{agent.name}</td>
                                            <td className="p-3">{agent.email}</td>
                                            <td className="p-3">{agent.mobile}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="p-3 text-center text-gray-500">
                                            No agents found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        <div className="bg-white mx-24 my-8 py-4 rounded-xl border border-gray-200">
        <div className="px-4 py-3">
            <h2 className="text-lg font-semibold">Upload and Distribute Lists</h2>
            <div className="flex mt-4">
                <input type="file" className="border p-2 rounded-lg" />
                <button className="ml-2 bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 cursor-pointer">
                    Upload & Distribute
                </button>
            </div>
        </div>
        </div>

    {
        showAddAgent && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                    <h3 className="text-2xl font-bold mb-4">Add Agent</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" name="name" value={agentData.name} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1" placeholder="Enter agent's name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" value={agentData.email} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1" placeholder="Enter agent's email" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <div className="flex">
                                <select name="countryCode" value={agentData.countryCode} onChange={handleInputChange} className="border border-gray-300 rounded-lg px-2 py-2 mr-2">
                                    <option value="+1">+1</option>
                                    <option value="+91">+91</option>
                                    <option value="+44">+44</option>
                                    <option value="+61">+61</option>
                                </select>
                                <input type="text" name="mobile" value={agentData.mobile} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="Enter agent's mobile number" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" name="password" value={agentData.password} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1" placeholder="Enter agent's password" />
                        </div>

                        <div className="flex justify-between mt-6">
                            <button onClick={() => setShowAddAgent(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">
                                Cancel
                            </button>
                            <button onClick={handleAddAgentSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    </div>
)
};

export default Dashboard;
