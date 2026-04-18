document.addEventListener("DOMContentLoaded", function() {
    
    // --- PART 1: LOAD SETTINGS (Yung kanina) ---
    fetch("api/get_settings.php")
    .then(res => res.json())
    .then(data => {
        if(data.redirect) { window.location.href = "Login.html"; return; }
        if(data.found) {
            setVal("username", data.username);
            setVal("farm_name", data.farm_name);
            setVal("farm_id", data.farm_id); 
            setVal("farm_type", data.farm_type);
            setVal("number_of_chickens", data.number_of_chickens);
            setVal("farm_location", data.farm_location);
            setVal("owner_name", data.owner_name);
            setVal("owner_email", data.owner_email);
            setVal("owner_phone", data.owner_phone);
        }
    })
    .catch(err => console.error("Error:", err));

    function setVal(id, val) {
        let el = document.getElementById(id);
        if(el) el.value = val || ""; 
    }

    // --- PART 2: SAVE SETTINGS (Yung kanina) ---
    const saveBtn = document.getElementById("saveBtn");
    if(saveBtn) {
        saveBtn.addEventListener("click", function(e) {
            e.preventDefault();
            const msg = document.getElementById("msg");
            saveBtn.innerText = "Saving...";
            
            const payload = {
                farm_name: document.getElementById("farm_name").value,
                farm_type: document.getElementById("farm_type").value,
                number_of_chickens: document.getElementById("number_of_chickens").value,
                farm_location: document.getElementById("farm_location").value,
                owner_name: document.getElementById("owner_name").value,
                owner_email: document.getElementById("owner_email").value,
                owner_phone: document.getElementById("owner_phone").value
            };

            fetch("api/save_settings.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                saveBtn.innerText = "Save Changes";
                if(data.success) {
                    msg.innerText = "✅ Saved!"; msg.style.color = "green";
                    setTimeout(() => location.reload(), 1000); 
                } else {
                    msg.innerText = "❌ " + data.error; msg.style.color = "red";
                }
            });
        });
    }

    // --- PART 3: CHANGE PASSWORD MODAL (ETO ANG BAGO!) ---
    
    const modal = document.getElementById("passwordModal");
    const openBtn = document.getElementById("openPassModalBtn");
    const closeBtn = document.getElementById("closePassModal");
    const passForm = document.getElementById("changePassForm");
    const passMsg = document.getElementById("passMsg");

    // Open Modal
    if(openBtn) {
        openBtn.addEventListener("click", () => {
            modal.style.display = "block";
            passForm.reset(); // Clear previous inputs
            passMsg.innerText = ""; 
        });
    }

    // Close Modal
    if(closeBtn) {
        closeBtn.addEventListener("click", () => modal.style.display = "none");
    }

    // Close if clicked outside
    window.addEventListener("click", (e) => {
        if (e.target == modal) modal.style.display = "none";
    });

    // Handle Form Submit
    if(passForm) {
        passForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const currentPass = document.getElementById("current_password").value;
            const newPass = document.getElementById("new_password").value;
            const confirmPass = document.getElementById("confirm_new_password").value;
            const btn = passForm.querySelector("button");

            // Validation
            if(newPass !== confirmPass) {
                passMsg.innerText = "❌ New passwords do not match!";
                passMsg.style.color = "red";
                return;
            }

            if(newPass.length < 6) {
                passMsg.innerText = "❌ Password must be at least 6 characters.";
                passMsg.style.color = "red";
                return;
            }

            btn.disabled = true;
            btn.innerText = "Updating...";

            fetch("api/change_password.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    current_password: currentPass, 
                    new_password: newPass 
                })
            })
            .then(res => res.json())
            .then(data => {
                btn.disabled = false;
                btn.innerText = "Update Password";

                if(data.success) {
                    passMsg.innerText = "✅ " + data.message;
                    passMsg.style.color = "green";
                    setTimeout(() => {
                        modal.style.display = "none";
                        passForm.reset();
                    }, 1500);
                } else {
                    passMsg.innerText = "❌ " + data.error;
                    passMsg.style.color = "red";
                }
            })
            .catch(err => {
                console.error(err);
                btn.disabled = false;
                passMsg.innerText = "❌ Server Error.";
            });
        });
    }
});