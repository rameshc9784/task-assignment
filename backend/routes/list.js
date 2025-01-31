// routes/upload.js
import express from 'express';
import multer from 'multer';
import Agent from '../modals/Agent.js';
import csv from 'csv-parser';
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path'; // Path module for file path manipulation
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// File upload configuration
const upload = multer({ dest: 'uploads/' });

// CSV validation function
const validateCSV = (data) => {
  const requiredFields = ['FirstName', 'Phone', 'Notes'];
  const headers = Object.keys(data[0]);
  return requiredFields.every((field) => headers.includes(field));
};

// Route for file upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Log uploaded file details for debugging
    console.log('Uploaded File:', req.file);
    console.log('File Mime Type:', req.file.mimetype);

    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    const fileExtension = path.extname(filePath).toLowerCase();

    // If the file extension is not being recognized, check mimetype
    let data = [];

    // Determine file type based on mimetype
    if (req.file.mimetype === 'text/csv' || fileExtension === '.csv') {
      console.log('Processing CSV file');
      // Parse CSV file
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => data.push(row))
        .on('end', async () => {
          // Validate CSV format
          if (!validateCSV(data)) {
            return res.status(400).json({ message: 'Invalid CSV format' });
          }

          await processAndDistributeTasks(data);
          fs.unlinkSync(filePath); // Remove the uploaded file after processing
          res.json({ message: 'Tasks distributed successfully' });
        });
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || fileExtension === '.xlsx' || fileExtension === '.xls') {
      console.log('Processing XLSX/XLS file');
      try {
        // Parse XLSX or XLS file with better error handling
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        data = xlsx.utils.sheet_to_json(sheet);

        await processAndDistributeTasks(data);
        fs.unlinkSync(filePath); // Remove the uploaded file after processing
        res.json({ message: 'Tasks distributed successfully' });
      } catch (error) {
        console.error('Error reading XLSX file:', error.message);
        return res.status(500).json({ message: 'Error reading XLSX file: ' + error.message });
      }
    } else {
      console.log('Unsupported file type:', req.file.mimetype);
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
    // Fetch all agents from the DB
    const agents = await Agent.find();

    if (agents.length === 0) {
      throw new Error('No agents found in the database');
    }

    const totalItems = data.length;
    const itemsPerAgent = Math.floor(totalItems / agents.length);
    let remainingItems = totalItems % agents.length;

    const distributions = agents.map((agent, index) => {
      const startIdx = index * itemsPerAgent;
      let assignedItems = data.slice(startIdx, startIdx + itemsPerAgent);

      // Distribute remaining tasks sequentially
      if (remainingItems > 0) {
        assignedItems.push(data[totalItems - remainingItems]); // Correct way to assign extra tasks
        remainingItems--;
      }

      return {
        agentName: agent.name,
        items: assignedItems,
      };
    });

    // Update agents with their tasks
    for (const distribution of distributions) {
      await Agent.updateOne(
        { name: distribution.agentName },
        { $set: { tasks: distribution.items } }
      );
    }
  } catch (error) {
    console.error('Error in task distribution:', error);
    throw new Error('Error in task distribution');
  }
};

export default router;
