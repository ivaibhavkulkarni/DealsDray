document.addEventListener('DOMContentLoaded', function() {
    // Display username on the dashboard
    const username = sessionStorage.getItem('username');
    if (username) {
        document.getElementById('usernameDisplay').textContent = `Welcome: ${username}`;
    } else {
        window.location.href = 'login.html'; // Redirect to login page if no username
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
            const jwtToken = sessionStorage.getItem('jwtToken'); // Retrieve JWT token from sessionStorage
            const response = await fetch('http://localhost:3000/employees', {
                headers: {
                    'Authorization': `Bearer ${jwtToken}` // Include token in the Authorization header
                }
            });
            if (response.ok) {
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
                            <th>Actions</th> <!-- New header for actions -->
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
                        <td>
                            <button class="edit-button" data-id="${employee.f_Id}">Edit</button>
                            <button class="delete-button" data-email="${employee.f_Email}">Delete</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });

                // Update the employee count
                employeeCount.textContent = employees.length;
            } else {
                console.error('Failed to fetch employee data:', response.statusText);
                alert('Failed to fetch employee data. Please log in again.');
                window.location.href = 'login.html'; // Redirect to login page if token is invalid
            }
        } catch (error) {
            console.error('Error fetching employee data:', error);
        }
    });

    // Handle Add Employee button click
    document.getElementById('addEmployeeButton').addEventListener('click', function() {
        window.location.href = 'updatepage.html'; // Redirect to the add/update page
    });

    // Handle delete button clicks
    document.getElementById('employee-table').addEventListener('click', async function(event) {
        if (event.target && event.target.classList.contains('delete-button')) {
            const employeeEmail = event.target.getAttribute('data-email'); // Get the email from data attribute
            if (confirm('Are you sure you want to delete this employee?')) {
                try {
                    const jwtToken = sessionStorage.getItem('jwtToken'); // Retrieve JWT token from sessionStorage
                    const response = await fetch(`http://localhost:3000/employees/${employeeEmail}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${jwtToken}` // Include token in the Authorization header
                        }
                    });
                    
                    if (response.ok) {
                        alert('Employee deleted successfully');
                        // Remove the row from the table
                        event.target.closest('tr').remove();
                        // Update the employee count
                        const employeeCount = document.getElementById('employee-count');
                        employeeCount.textContent = parseInt(employeeCount.textContent) - 1;
                    } else {
                        const result = await response.text();
                        alert('Error: ' + result);
                    }
                } catch (error) {
                    console.error('Error deleting employee:', error);
                }
            }
        }
    });

    // Handle edit button clicks
    document.getElementById('employee-table').addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('edit-button')) {
            const employeeId = event.target.getAttribute('data-id');
            window.location.href = `edit.html?id=${employeeId}`; 
        }
    });
});
