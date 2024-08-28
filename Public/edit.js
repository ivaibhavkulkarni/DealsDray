document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('editForm');
    const employeeId = document.getElementById('employeeId');

    const fetchEmployeeData = async (id) => {
        try {
            const response = await fetch(`/employee/${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            // Populate form fields with employee data
            document.getElementById('name').value = data.f_Name || '';
            document.getElementById('email').value = data.f_Email || '';
            document.getElementById('mobile').value = data.f_Mobile || '';
            document.getElementById('designation').value = data.f_Designation || '';

            // Set gender radio button
            const genderRadio = document.querySelector(`input[name="gender"][value="${data.f_gender}"]`);
            if (genderRadio) {
                genderRadio.checked = true;
            }

            // Set course checkboxes
            const courses = data.f_Course ? data.f_Course.split(',') : [];
            document.querySelectorAll('input[name="course"]').forEach(checkbox => {
                checkbox.checked = courses.includes(checkbox.value);
            });
        } catch (error) {
            console.error('Error fetching employee data:', error);
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const designation = document.getElementById('designation').value;
        const gender = document.querySelector('input[name="gender"]:checked')?.value;
        const courses = Array.from(document.querySelectorAll('input[name="course"]:checked')).map(cb => cb.value);

        // Validation
        if (!name || !email || !mobile || !designation || !gender) {
            alert('Please fill in all required fields');
            return;
        }

        // Create FormData object
        const formData = new FormData();
        formData.append('f_Name', name);
        formData.append('f_Email', email);
        formData.append('f_Mobile', mobile);
        formData.append('f_Designation', designation);
        formData.append('f_gender', gender);
        formData.append('f_Course', courses.join(','));

        // Handle file input (image)
        const imageInput = document.getElementById('image');
        if (imageInput.files.length > 0) {
            formData.append('f_Image', imageInput.files[0]); // Ensure 'f_Image' matches the API
        }

        // Send data to server
        try {
            const response = await fetch(`/employees/${employeeId.value}`, {
                method: 'PUT',
                body: formData
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.text();
            alert(result);
        } catch (error) {
            console.error('Error updating employee:', error);
            alert('Failed to update employee');
        }
    });

    // Get the ID from the query string and fetch employee data
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) {
        employeeId.value = id;
        fetchEmployeeData(id);
    }

    // Logout functionality
    document.getElementById('logoutButton').addEventListener('click', function() {
        sessionStorage.clear(); // Clear session storage on logout
        window.location.href = 'login.html'; // Redirect to login page
    });
});
