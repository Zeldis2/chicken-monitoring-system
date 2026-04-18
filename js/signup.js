// FILE: js/signup.js
document.getElementById("signupForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const form = document.getElementById("signupForm");
    
    // ITO YUNG BAGONG DAGDAG NA HARANG!
    // Kung may blanko, magpapakita siya ng "Please fill out this field"
    if (!form.checkValidity()) {
        form.reportValidity();
        return; // Hihinto ang code dito, hindi pupunta sa database
    }

    const note = document.getElementById("note");
    const btn = document.querySelector('button[type="submit"]');

    note.innerText = "⏳ Processing...";
    note.style.color = "#F7941E";
    btn.disabled = true;

    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm_password").value;

    if(password !== confirm) {
        note.innerText = "❌ Passwords do not match!";
        note.style.color = "red";
        btn.disabled = false;
        return;
    }

    // Prepare Payload
    const payload = {
        fullname: document.getElementById("fullname").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        username: document.getElementById("username").value,
        password: password,
        farm_name: document.getElementById("farm_name").value,
        farm_location: document.getElementById("farm_location").value,
        farm_type: document.getElementById("farm_type").value,
        chicken_count: document.getElementById("chicken_count").value,
        units: document.getElementById("units").value,
        notify_sms: document.querySelector('input[name="notify_sms"]').checked,
        notify_email: document.querySelector('input[name="notify_email"]').checked,
        enable_system: document.querySelector('input[name="enable_system"]').checked
    };

    fetch("api/signup.php", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(res => res.text()) // Get text first to see PHP errors
    .then(text => {
        try {
            const data = JSON.parse(text);
            if(data.status === 'success') {
                note.innerText = "✅ " + data.message;
                note.style.color = "green";
                setTimeout(() => {
                    window.location.href = "Login.html"; 
                }, 2000);
            } else {
                note.innerText = "❌ " + (data.message || "Signup failed");
                note.style.color = "red";
                btn.disabled = false;
            }
        } catch (err) {
            console.error("RAW SERVER OUTPUT:", text);
            // Dito natin makikita kung ano talaga ang mali
            note.innerText = "❌ Server Error: " + text.substring(0, 50) + "... (Check Console)";
            note.style.color = "red";
            btn.disabled = false;
        }
    })
    .catch(err => {
        console.error("NETWORK ERROR:", err);
        note.innerText = "❌ Connection Failed";
        note.style.color = "red";
        btn.disabled = false;
    });
});