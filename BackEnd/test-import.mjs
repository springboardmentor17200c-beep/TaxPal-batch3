// Test import of auth routes
try {
  console.log("Attempting to import auth routes...");
  const authRoutes = await import("./routes/auth.js");
  console.log("✅ Auth routes imported successfully");
  console.log("Exported:", authRoutes);
} catch (err) {
  console.error("❌ Error importing auth routes:", err.message);
  console.error(err.stack);
}
