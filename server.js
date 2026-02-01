import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Helper function to run scripts
const runScript = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        reject({ error: error.message, stderr, stdout });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

// Endpoint to refresh task dates
app.post('/api/refresh-tasks', async (req, res) => {
  try {
    console.log('Running refresh-tasks script...');
    const result = await runScript('node scripts/update-task-dates.js');
    res.json({
      success: true,
      message: 'Tasks refreshed successfully!',
      output: result.stdout,
    });
  } catch (error) {
    console.error('Error running refresh-tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh tasks',
      error: error.error || error.message,
      output: error.stdout || '',
    });
  }
});

// Endpoint to optimize travel
app.post('/api/optimize-travel', async (req, res) => {
  try {
    const { strategy, days, maxTasks } = req.body;
    console.log('Running optimize-travel script...');
    const command = `node scripts/optimize-travel.js --strategy ${strategy} --days ${days} --max-tasks ${maxTasks}`;
    const result = await runScript(command);
    res.json({
      success: true,
      message: 'Travel optimization completed!',
      output: result.stdout,
    });
  } catch (error) {
    console.error('Error running optimize-travel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize travel',
      error: error.error || error.message,
      output: error.stdout || '',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available:`);
  console.log(`   POST /api/refresh-tasks`);
  console.log(`   POST /api/optimize-travel`);
  console.log(`   GET  /api/health`);
});
