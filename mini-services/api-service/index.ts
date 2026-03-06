#!/usr/bin/env bun
/**
 * BizGen AI - FastAPI Backend Service
 * Entry point script for starting the service
 */

const PORT = process.env.API_PORT || 3001;

console.log(`Starting BizGen AI API Server on port ${PORT}...`);

// Change to api-service directory and run uvicorn
process.chdir(import.meta.dir);

// Run the FastAPI server using Python
Bun.spawn([
  "/usr/bin/python3",
  "-m",
  "uvicorn",
  "app.main:app",
  "--host",
  "0.0.0.0",
  "--port",
  PORT.toString(),
  "--reload",
  "--reload-dir",
  "app",
], {
  cwd: import.meta.dir,
  stdio: ["inherit", "inherit", "inherit"],
  env: {
    ...process.env,
    PYTHONUNBUFFERED: "1",
  },
});
