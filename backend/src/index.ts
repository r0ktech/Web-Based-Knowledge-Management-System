import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import leadersRoutes from './routes/leaders';
import eventsRoutes from './routes/events';
import documentsRoutes from './routes/documents';
import analyticsRoutes from './routes/analytics';
import auditRoutes from './routes/audit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for local deployment testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serving mock uploads directory
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), service: 'Abia State KMS API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaders', leadersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error occurred', error: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Abia State KMS Server running on port ${PORT} `);
  console.log(` Health Check: http://localhost:${PORT}/api/health `);
  console.log(`===============================================`);
});
