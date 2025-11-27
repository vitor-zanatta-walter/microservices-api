import 'dotenv/config';
import express from "express";

import enrollmentsRouter from './routes/enrollments.js';
import authMiddleware from './middleware/authMiddleware.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT;

app.use(authMiddleware);
app.use(enrollmentsRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

