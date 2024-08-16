document.addEventListener('DOMContentLoaded', function() {
    // Retrieve username from sessionStorage
    const username = sessionStorage.getItem('username');
    if (username) {
        document.getElementById('usernameDisplay').textContent = `Welcome, ${username}`;
    } else {
        document.getElementById('usernameDisplay').textContent = 'Welcome, Guest';
    }

    // Handle the form submission
    document.querySelector('form').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const mobile = document.getElementById('mobile').value;
        const designation = document.getElementById('designation').value;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const course = Array.from(document.querySelectorAll('input[name="course"]:checked')).map(cb => cb.value).join(', '); // Join array into string
        
        // Handle image upload
        const imageFile = document.getElementById('image').files[0];

        // Create a FormData object for the file upload
        const formData = new FormData();
        formData.append('f_Name', name);
        formData.append('f_Email', email);
        formData.append('f_Mobile', mobile);
        formData.append('f_Designation', designation);
        formData.append('f_gender', gender);
        formData.append('f_Course', course); // If course is a string, just append it directly
        if (imageFile) formData.append('f_Image', imageFile); // Append the file if it exists

        try {
            const response = await fetch('http://localhost:3000/employees', {
                method: 'POST',
                body: formData
            });

            const result = await response.text();

            if (response.ok) {
                alert('Employee added successfully');
                window.location.href = 'Dashboard.html'; // Redirect to dashboard or another page
            } else {
                alert('Error: ' + result);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
    });

    // Handle logout button click
    document.getElementById('logoutButton').addEventListener('click', () => {
        sessionStorage.removeItem('username');
        window.location.href = 'login.html'; // Redirect to login page
    });
});
