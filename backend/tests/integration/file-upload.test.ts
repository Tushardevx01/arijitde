import request from 'supertest';
import express from 'express';
import multer from 'multer';
import { requestIdMiddleware } from '../../src/middleware/requestId';
import { errorHandler } from '../../src/middleware/error';
import { ApiError } from '../../src/lib/api-error';
import cookieParser from 'cookie-parser';

describe('File Upload Integration', () => {
  let app: ReturnType<typeof express>;
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (_req, file, cb) => {
      const allowedMimes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv',
      ];
      const ext = file.originalname.split('.').pop()?.toLowerCase();
      
      if (
        allowedMimes.includes(file.mimetype) ||
        ext === 'csv' ||
        ext === 'xlsx' ||
        ext === 'xls'
      ) {
        cb(null, true);
      } else {
        cb(new Error('Only Excel (.xlsx/.xls) and CSV files are accepted'));
      }
    },
  });

  describe('File Upload Validation', () => {
    let app: ReturnType<typeof express>;

    beforeEach(() => {
      app = express();
      app.use(express.json({ limit: '50kb' }));
      app.use(cookieParser());
      app.use(requestIdMiddleware);
      
      app.get('/api/health', (req, res) => {
        res.json({ success: true, data: { status: 'healthy' }, requestId: req.requestId });
      });
      app.get('/api/csrf', (req, res) => {
        res.json({ success: true });
      });
      
      // File upload endpoint
      app.post('/api/test/upload', upload.single('file'), (req, res, next) => {
        try {
          if (!req.file) {
            throw ApiError.badRequest('File is required');
          }
          
          // Check file size
          if (req.file.size > 10 * 1024 * 1024) {
            throw ApiError.badRequest('File size exceeds 10MB limit');
          }
          
          res.json({
            success: true,
            data: {
              filename: req.file.originalname,
              mimetype: req.file.mimetype,
              size: req.file.size,
            },
          });
        } catch (error) {
          next(error);
        }
      });
      
      app.use((req, res, next) => {
        next(ApiError.notFound('Route not found'));
      });
      app.use(require('../../src/middleware/error').errorHandler);
    });

    it('should upload a valid Excel file', async () => {
      const res = await request(app)
        .post('/api/test/upload')
        .attach('file', Buffer.from('test,data\n1,2'), 'test.csv')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.filename).toBe('test.csv');
      expect(res.body.data.mimetype).toBe('text/csv');
    });

    it('should reject files exceeding size limit', async () => {
      // Create a buffer larger than 10MB
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024, 'x');
      
      const res = await request(app)
        .post('/api/test/upload')
        .attach('file', largeBuffer, 'large.csv')
        .expect(500); // Multer errors are 500

      expect(res.body.title).toBe('Internal Server Error');
    });

    it('should reject unsupported file types', async () => {
      const res = await request(app)
        .post('/api/test/upload')
        .attach('file', Buffer.from('test content'), 'test.pdf')
        .expect(500); // Multer errors are 500

      expect(res.body.title).toBe('Internal Server Error');
    });

    it('should reject missing file', async () => {
      const res = await request(app)
        .post('/api/test/upload')
        .expect(400);

      expect(res.body.title).toBe('Bad Request');
      expect(res.body.detail).toContain('File is required');
    });
  });
});