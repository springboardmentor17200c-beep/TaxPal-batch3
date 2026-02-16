async function testLogin() {
  try {
    console.log("Testing login with test@example.com / password123...");
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: "test@example.com", 
        password: "password123" 
      })
    });
    
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response:", text);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testLogin();
