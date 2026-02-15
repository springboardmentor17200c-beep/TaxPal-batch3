// Simple test to check if API endpoints work
async function testAPI() {
  try {
    console.log("Testing forgot-password endpoint...");
    const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" })
    });
    
    const text = await response.text();
    console.log("Status:", response.status);
    console.log("Response:", text);
    
    try {
      const json = JSON.parse(text);
      console.log("Parsed JSON:", json);
    } catch (e) {
      console.log("Failed to parse as JSON - got HTML or plain text");
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testAPI();
