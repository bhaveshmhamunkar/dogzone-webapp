console.log("Script loaded successfully");

document.getElementById('reportForm').addEventListener('submit', async (event) => {
    event.preventDefault();  // ✅ Prevents default form submit

    const form = event.target;
    const formData = new FormData(form);

    try {
        const response = await fetch('http://127.0.0.1:8000/api/reports/', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Report submitted successfully!');
            form.reset();  // clear form fields
        } else {
            alert('Failed to report. Please check your input type!!');
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred while submitting the report.');
    }
});
