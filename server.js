import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Configure CORS to allow requests from Vite dev server
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173'],
  methods: ['GET', 'POST'],
  credentials: true
}));
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

// Endpoint to progress tasks
app.post('/api/progress-task', async (req, res) => {
  try {
    const { taskIds, newStatus, resourceId } = req.body;
    
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'taskIds array is required'
      });
    }
    
    if (!newStatus) {
      return res.status(400).json({
        success: false,
        error: 'newStatus is required'
      });
    }
    
    console.log(`Progressing ${taskIds.length} task(s) to status: ${newStatus}${resourceId ? `, resource: ${resourceId}` : ''}`);
    
    // In a real implementation, this would update a database
    // For now, we'll simulate the update and return success
    const updates = taskIds.map(taskId => ({
      taskId,
      oldStatus: 'ACT', // Would come from DB
      newStatus,
      resourceId: resourceId || null,
      updatedAt: new Date().toISOString()
    }));
    
    res.json({
      success: true,
      message: `Successfully progressed ${taskIds.length} task(s) to ${newStatus}`,
      updates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error progressing task:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to progress task',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Task Management Backend API',
    endpoints: {
      health: 'GET /api/health',
      refreshTasks: 'POST /api/refresh-tasks',
      optimizeTravel: 'POST /api/optimize-travel'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available:`);
  console.log(`   POST /api/refresh-tasks`);
  console.log(`   POST /api/optimize-travel`);
  console.log(`   GET  /api/health`);
});
