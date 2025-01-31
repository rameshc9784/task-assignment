import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors'
import 'dotenv/config'

import authRoutes from './routes/auth.js'
import agentRoutes from './routes/agent.js'
import listRoutes from './routes/list.js'

const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

mongoose.connect(process.env.MONGO_DB_URL, {
    autoIndex: true,
})


const PORT  = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.send('Hello World')
}) 

app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/lists', listRoutes);

app.listen(PORT, () => {
    console.log('Server start on port : ' + PORT)
})