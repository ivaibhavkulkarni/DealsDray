document.addEventListener('DOMContentLoaded', function() {
    // Display username on the dashboard
    const username = sessionStorage.getItem('username');
    if (username) {
        document.getElementById('usernameDisplay').textContent = `${username}`;
    } else {
        document.getElementById('usernameDisplay').textContent = 'Logged in as: Guest';
    }

    // Handle logout button click
    document.getElementById('logoutButton').addEventListener('click', function() {
        sessionStorage.clear(); // Clear session storage on logout
        window.location.href = 'login.html'; // Redirect to login page
    });

    // Handle Employee List button click
    document.getElementById('employeeListButton').addEventListener('click', async function() {
        const employeeSection = document.getElementById('employee-section');
        employeeSection.style.display = 'block';

        // Fetch employee data and display in the table
        try {
            const response = await fetch('http://localhost:3000/employees');
            const employees = await response.json();
            const employeeTable = document.getElementById('employee-table');
            const employeeCount = document.getElementById('employee-count');

            // Clear existing rows
            employeeTable.innerHTML = `
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Designation</th>
                        <th>Gender</th>
                        <th>Course</th>
                        <th>Create Date</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `;

            const tbody = employeeTable.querySelector('tbody');
            employees.forEach(employee => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${employee.f_Id}</td>
                    <td><img src="${employee.f_Image}" alt="Image" width="50"></td>
                    <td>${employee.f_Name}</td>
                    <td>${employee.f_Email}</td>
                    <td>${employee.f_Mobile}</td>
                    <td>${employee.f_Designation}</td>
                    <td>${employee.f_gender}</td>
                    <td>${employee.f_Course}</td>
                    <td>${employee.f_Createdate}</td>
                `;
                tbody.appendChild(row);
            });

            // Update the employee count
            employeeCount.textContent = employees.length;
        } catch (error) {
            console.error('Error fetching employee data:', error);
        }
    });

    // Handle Add Employee button click
    document.getElementById('addEmployeeButton').addEventListener('click', function() {
        window.location.href = 'updatepage.html'; // Redirect to the update page
    });
});
