import express from 'express';
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'
import userAuth_route from './routes/user/authRoutes'
import problem_route from './routes/user/problemRoute';

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_DB_URL = process.env.MONGODB_URI;

const corsOptions = {
    origin:["http://localhost:3000"],
    optionsSuccessStatus: 200,
    credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json())

if(!MONGO_DB_URL){
  throw new Error('MONGO_DB_URL is not defined in the environment variables');
}

mongoose.connect(MONGO_DB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
});

app.use('/auth',userAuth_route)
app.use('/',problem_route)



app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
