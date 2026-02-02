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
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://localhost:4173'],
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
    const { taskIds, newStatus, resourceId, resourceName, userName = 'System', progressNote, awaitingConfirmation } = req.body;
    
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
    
    console.log(`Progressing ${taskIds.length} task(s) to status: ${newStatus}${resourceId ? `, resource: ${resourceId}` : ''}${progressNote ? ` with note` : ''}`);
    
    // Create progress note text
    const timestamp = new Date().toISOString();
    const statusLabels = {
      ACT: 'Active',
      AWI: 'Awaiting Issue',
      ISS: 'Issued',
      EXC: 'Executing',
      COM: 'Complete',
      FUR: 'Furthered',
      CMN: 'Comment',
      HPD: 'Held Pending',
      HLD: 'On Hold',
      CPD: 'Copied',
      DLG: 'Delegated',
      CAN: 'Cancelled'
    };
    
    // Build automatic note text
    let autoNoteText = `Status changed to ${statusLabels[newStatus] || newStatus}`;
    if (resourceId && resourceName) {
      autoNoteText += `. Assigned to ${resourceName} (${resourceId})`;
    }
    if (awaitingConfirmation === 'Y') {
      autoNoteText += ' (Awaiting Confirmation)';
    }
    
    // Use user's note if provided, otherwise use auto-generated text
    const finalNoteText = progressNote ? `${autoNoteText}\n\nNote: ${progressNote}` : autoNoteText;
    
    // In a real implementation, this would update a database and append progress notes
    // For now, we'll simulate the update and return the note to be added
    const updates = taskIds.map(taskId => ({
      taskId,
      oldStatus: 'ACT', // Would come from DB
      newStatus,
      resourceId: resourceId || null,
      resourceName: resourceName || null,
      awaitingConfirmation: awaitingConfirmation || 'N',
      updatedAt: timestamp,
      progressNote: {
        id: `P-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        author: userName,
        createdAt: timestamp,
        text: finalNoteText
      }
    }));
    
    res.json({
      success: true,
      message: `Successfully progressed ${taskIds.length} task(s) to ${newStatus}`,
      updates,
      timestamp
    });
  } catch (error) {
    console.error('Error progressing task:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to progress task',
    });
  }
});

// Endpoint to add quick notes to tasks
app.post('/api/add-task-notes', async (req, res) => {
  try {
    const { taskIds, note, userName = 'System' } = req.body;
    
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'taskIds array is required'
      });
    }
    
    if (!note || !note.trim()) {
      return res.status(400).json({
        success: false,
        error: 'note is required'
      });
    }
    
    console.log(`Adding note to ${taskIds.length} task(s)`);
    
    const timestamp = new Date().toISOString();
    
    // In a real implementation, this would update a database and append progress notes
    // For now, we'll simulate adding notes and return them to be displayed
    const updates = taskIds.map(taskId => ({
      taskId,
      updatedAt: timestamp,
      progressNote: {
        id: `N-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        author: userName,
        createdAt: timestamp,
        text: note.trim()
      }
    }));
    
    res.json({
      success: true,
      message: `Successfully added note to ${taskIds.length} task(s)`,
      updates,
      timestamp
    });
  } catch (error) {
    console.error('Error adding task notes:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add notes',
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
  console.log(`   POST /api/progress-task`);
  console.log(`   GET  /api/health`);
});
