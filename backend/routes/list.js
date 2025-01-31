import express from 'express';
import multer from 'multer';
import Agent from '../modals/Agent.js';
import csv from 'csv-parser';
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// File upload configuration (only allow CSV/XLSX/XLS)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["text/csv", 
                          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                          "application/vnd.ms-excel"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV, XLSX, or XLS files are allowed"), false);
    }
  }
});

// CSV validation function
const validateCSV = (data) => {
  const requiredFields = ['FirstName', 'Phone', 'Notes'];
  const headers = Object.keys(data[0]);
  return requiredFields.every((field) => headers.includes(field));
};

// Route for file upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Uploaded File:', req.file);
    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    const fileExtension = path.extname(filePath).toLowerCase();
    let data = [];

    if (req.file.mimetype === 'text/csv' || fileExtension === '.csv') {
      console.log('Processing CSV file');
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => data.push(row))
        .on('end', async () => {
          if (!validateCSV(data)) {
            return res.status(400).json({ message: 'Invalid CSV format' });
          }

          await processAndDistributeTasks(data);
          fs.unlinkSync(filePath);
          res.json({ message: 'Tasks distributed successfully' });
        });
    } else if (req.file.mimetype.includes('spreadsheetml') || fileExtension === '.xlsx' || fileExtension === '.xls') {
      console.log('Processing XLSX/XLS file');
      try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        data = xlsx.utils.sheet_to_json(sheet);

        if (!validateCSV(data)) {
          return res.status(400).json({ message: 'Invalid file format' });
        }

        await processAndDistributeTasks(data);
        fs.unlinkSync(filePath);
        res.json({ message: 'Tasks distributed successfully' });
      } catch (error) {
        console.error('Error reading XLSX file:', error.message);
        return res.status(500).json({ message: 'Error reading XLSX file: ' + error.message });
      }
    } else {
      return res.status(400).json({ message: 'Unsupported file type' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process and distribute tasks among agents
const processAndDistributeTasks = async (data) => {
  try {
    // Fetch 5 agents from the DB
    const agents = await Agent.find();

    const totalItems = data.length;
    const itemsPerAgent = Math.floor(totalItems / agents.length);
    let remainingItems = totalItems % agents.length;

    let assignedTasks = [];
    let taskIndex = 0;

    // Distribute tasks equally
    for (let i = 0; i < agents.length; i++) {
      let taskCount = itemsPerAgent;

      // Distribute remaining items one by one to agents
      if (remainingItems > 0) {
        taskCount++;
        remainingItems--;
      }

      const agentTasks = data.slice(taskIndex, taskIndex + taskCount);
      taskIndex += taskCount;

      assignedTasks.push({ agentId: agents[i]._id, tasks: agentTasks });
    }

    // Update agents with assigned tasks
    for (const task of assignedTasks) {
      await Agent.updateOne(
        { _id: task.agentId },
        { $set: { tasks: task.tasks } }
      );
    }

    console.log("Tasks successfully distributed among agents!");
  } catch (error) {
    console.error('Error in task distribution:', error);
    throw new Error('Error in task distribution');
  }
};


export default router;
