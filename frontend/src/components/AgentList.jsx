import React from "react";

const AgentList = () => {
  const users = [
    { name: "John Doe", email: "john@example.com", mobile: "9876543210" },
    { name: "Alice Smith", email: "alice@example.com", mobile: "9123456789" },
    { name: "Bob Johnson", email: "bob@example.com", mobile: "9988776655" },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Mobile</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={index}
                className="border-t border-gray-300 hover:bg-gray-100"
              >
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.mobile}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentList;
