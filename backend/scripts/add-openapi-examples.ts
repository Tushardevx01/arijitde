import * as fs from 'fs';
import * as path from 'path';

const openApiPath = path.join(__dirname, '..', 'src', 'lib', 'openapi.json');

const spec = JSON.parse(fs.readFileSync(openApiPath, 'utf-8'));

function addExamples() {
  // Auth Register
  const registerPath = spec.paths['/auth/register'].post;
  registerPath.requestBody.content['application/json'].examples = {
    valid: {
      summary: 'Valid registration',
      value: {
        email: 'john.doe@example.com',
        password: 'SecurePass123!',
        name: 'John Doe',
        phone: '+1-555-0123'
      }
    }
  };
  registerPath.responses['201'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'Registration successful',
          value: {
            success: true,
            data: {
              user: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                email: 'john.doe@example.com',
                name: 'John Doe'
              },
              accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        }
      }
    }
  };

  // Auth Login
  const loginPath = spec.paths['/auth/login'].post;
  loginPath.requestBody.content['application/json'].examples = {
    valid: {
      summary: 'Valid login',
      value: {
        email: 'john.doe@example.com',
        password: 'SecurePass123!'
      }
    }
  };
  loginPath.responses['200'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'Login successful',
          value: {
            success: true,
            data: {
              user: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                email: 'john.doe@example.com',
                name: 'John Doe'
              },
              accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        }
      }
    }
  };

  // Auth Forgot Password
  const forgotPath = spec.paths['/auth/forgot-password'].post;
  forgotPath.requestBody.content['application/json'].examples = {
    valid: {
      summary: 'Request password reset',
      value: {
        email: 'john.doe@example.com'
      }
    }
  };

  // Auth Reset Password
  const resetPath = spec.paths['/auth/reset-password'].post;
  resetPath.requestBody.content['application/json'].examples = {
    valid: {
      summary: 'Reset password with OTP',
      value: {
        email: 'john.doe@example.com',
        otp: '123456',
        newPassword: 'NewSecurePass123!'
      }
    }
  };

  // Auth Verify OTP
  const verifyOtpPath = spec.paths['/auth/verify-otp'].post;
  verifyOtpPath.requestBody.content['application/json'].examples = {
    valid: {
      summary: 'Verify OTP',
      value: {
        email: 'john.doe@example.com',
        otp: '123456'
      }
    }
  };

  // Assessment Create
  const assessPath = spec.paths['/assess'].post;
  assessPath.requestBody.content['application/json'].examples = {
    conservative: {
      summary: 'Conservative investor',
      value: {
        age: 45,
        goal: 'RETIREMENT',
        ageRange: '40-50',
        lifeStage: 'MID_CAREER',
        investmentTenure: '10-15_YEARS',
        isCompletePortfolio: false,
        investmentStyle: 'CONSERVATIVE',
        expectedReturn: '8-10%',
        riskBehavior: 'LOW_RISK',
        monthlyInvestment: '50000-100000',
        emergencyFund: '6-12_MONTHS'
      }
    },
    aggressive: {
      summary: 'Aggressive investor',
      value: {
        age: 30,
        goal: 'WEALTH_CREATION',
        ageRange: '25-35',
        lifeStage: 'EARLY_CAREER',
        investmentTenure: '15-20_YEARS',
        isCompletePortfolio: false,
        investmentStyle: 'AGGRESSIVE',
        expectedReturn: '15%+',
        riskBehavior: 'HIGH_RISK',
        monthlyInvestment: '100000+',
        emergencyFund: '3-6_MONTHS'
      }
    }
  };
  assessPath.responses['201'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'Assessment created',
          value: {
            success: true,
            data: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              userId: '550e8400-e29b-41d4-a716-446655440000',
              age: 30,
              goal: 'WEALTH_CREATION',
              riskBehavior: 'HIGH_RISK',
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z'
            }
          }
        }
      }
    }
  };

  // Portfolio Create
  const portfolioPath = spec.paths['/portfolio'].post;
  portfolioPath.requestBody.content['application/json'].examples = {
    valid: {
      summary: 'Create portfolio',
      value: {
        name: 'Retirement Portfolio',
        assessmentId: '550e8400-e29b-41d4-a716-446655440001',
        description: 'Long-term retirement savings'
      }
    }
  };

  // Score Calculate
  const scorePath = spec.paths['/score'].post;
  scorePath.requestBody.content['application/json'].examples = {
    valid: {
      summary: 'Calculate score',
      value: {
        portfolioId: '550e8400-e29b-41d4-a716-446655440002'
      }
    }
  };
  scorePath.responses['201'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'Score calculated',
          value: {
            success: true,
            data: {
              id: '550e8400-e29b-41d4-a716-446655440003',
              portfolioId: '550e8400-e29b-41d4-a716-446655440002',
              total: 85,
              goalAlignment: 90,
              assetAlloc: 80,
              diversification: 85,
              discipline: 88,
              efficiency: 82,
              tag: 'OPTIMIZED',
              insights: 'Well-diversified portfolio with good goal alignment.',
              createdAt: '2024-01-15T11:00:00.000Z',
              updatedAt: '2024-01-15T11:00:00.000Z'
            }
          }
        }
      }
    }
  };

  // Leads Create
  const leadsPath = spec.paths['/leads'].post;
  leadsPath.requestBody.content['application/json'].examples = {
    valid: {
      summary: 'Create lead',
      value: {
        name: 'Jane Smith',
        phone: '+1-555-0456',
        scoreId: '550e8400-e29b-41d4-a716-446655440003',
        slot: '2024-01-20T14:00:00.000Z'
      }
    }
  };
  leadsPath.responses['201'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'Lead created',
          value: {
            success: true,
            data: {
              id: '550e8400-e29b-41d4-a716-446655440004',
              userId: '550e8400-e29b-41d4-a716-446655440000',
              name: 'Jane Smith',
              phone: '+1-555-0456',
              scoreId: '550e8400-e29b-41d4-a716-446655440003',
              slot: '2024-01-20T14:00:00.000Z',
              status: 'NEW',
              createdAt: '2024-01-15T11:30:00.000Z',
              updatedAt: '2024-01-15T11:30:00.000Z'
            }
          }
        }
      }
    }
  };

  // Leads List (with pagination)
  const listLeadsPath = spec.paths['/leads'].get;
  listLeadsPath.responses['200'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/PaginatedResponse' },
      examples: {
        success: {
          summary: 'Paginated leads',
          value: {
            success: true,
            data: {
              items: [
                {
                  id: '550e8400-e29b-41d4-a716-446655440004',
                  userId: '550e8400-e29b-41d4-a716-446655440000',
                  name: 'Jane Smith',
                  phone: '+1-555-0456',
                  scoreId: '550e8400-e29b-41d4-a716-446655440003',
                  slot: '2024-01-20T14:00:00.000Z',
                  status: 'NEW',
                  createdAt: '2024-01-15T11:30:00.000Z',
                  updatedAt: '2024-01-15T11:30:00.000Z',
                  user: { id: '550e8400-e29b-41d4-a716-446655440000', email: 'john.doe@example.com' }
                }
              ],
              total: 1,
              page: 1,
              nextCursor: 'eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwNCJ9',
              nextCursorId: '550e8400-e29b-41d4-a716-446655440004'
            }
          }
        }
      }
    }
  };

  // Book Session (authenticated)
  const bookSessionPath = spec.paths['/leads/book-session'].post;
  bookSessionPath.requestBody.content['application/json'].examples = {
    valid: {
      summary: 'Book advisory session',
      value: {
        slot1: '2024-01-22T10:00:00.000Z',
        slot2: '2024-01-22T14:00:00.000Z',
        slot3: '2024-01-23T10:00:00.000Z'
      }
    }
  };

  // Book Session Public
  const bookPublicPath = spec.paths['/leads/book-session-public'].post;
  bookPublicPath.requestBody.content['application/json'].examples = {
    valid: {
      summary: 'Public session booking',
      value: {
        name: 'Alice Johnson',
        phone: '+1-555-0789',
        email: 'alice@example.com',
        slot1: '2024-01-22T10:00:00.000Z',
        slot2: '2024-01-22T14:00:00.000Z',
        slot3: '2024-01-23T10:00:00.000Z'
      }
    }
  };

  // Contact Form
  const contactPath = spec.paths['/contact'].post;
  contactPath.requestBody.content['application/json'].examples = {
    valid: {
      summary: 'Contact form submission',
      value: {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        phone: '+1-555-0999',
        subject: 'Investment Inquiry',
        message: 'I would like to know more about your wealth management services.'
      }
    }
  };
  contactPath.responses['201'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'Contact submitted',
          value: {
            success: true,
            data: {
              id: '550e8400-e29b-41d4-a716-446655440005',
              name: 'Bob Wilson',
              email: 'bob@example.com',
              subject: 'Investment Inquiry',
              createdAt: '2024-01-15T12:00:00.000Z'
            }
          }
        }
      }
    }
  };

  // Support Query
  const supportPath = spec.paths['/support'].post;
  supportPath.requestBody.content['application/json'].examples = {
    valid: {
      summary: 'Submit support query',
      value: {
        subject: 'Unable to access portfolio',
        message: 'I cannot view my portfolio dashboard after login.',
        priority: 'HIGH'
      }
    }
  };
  supportPath.responses['201'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'Support query submitted',
          value: {
            success: true,
            data: {
              id: '550e8400-e29b-41d4-a716-446655440006',
              userId: '550e8400-e29b-41d4-a716-446655440000',
              subject: 'Unable to access portfolio',
              message: 'I cannot view my portfolio dashboard after login.',
              priority: 'HIGH',
              status: 'OPEN',
              createdAt: '2024-01-15T12:00:00.000Z',
              updatedAt: '2024-01-15T12:00:00.000Z'
            }
          }
        }
      }
    }
  };

  // Admin List Users
  const adminUsersPath = spec.paths['/admin/users'].get;
  adminUsersPath.responses['200'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/PaginatedResponse' },
      examples: {
        success: {
          summary: 'Paginated users',
          value: {
            success: true,
            data: {
              items: [
                {
                  id: '550e8400-e29b-41d4-a716-446655440000',
                  email: 'john.doe@example.com',
                  name: 'John Doe',
                  role: 'USER',
                  createdAt: '2024-01-10T08:00:00.000Z',
                  _count: { leads: 2, portfolios: 1 }
                }
              ],
              total: 1,
              page: 1
            }
          }
        }
      }
    }
  };

  // Auth Me
  const authMePath = spec.paths['/auth/me'].get;
  authMePath.responses['200'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'Current user profile',
          value: {
            success: true,
            data: {
              user: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                email: 'john.doe@example.com',
                name: 'John Doe',
                role: 'USER',
                createdAt: '2024-01-10T08:00:00.000Z'
              }
            }
          }
        }
      }
    }
  };

  // Assessment Get by ID
  const getAssessPath = spec.paths['/assess/{id}'].get;
  getAssessPath.responses['200'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'Assessment found',
          value: {
            success: true,
            data: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              userId: '550e8400-e29b-41d4-a716-446655440000',
              age: 30,
              goal: 'WEALTH_CREATION',
              riskBehavior: 'HIGH_RISK',
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z'
            }
          }
        }
      }
    }
  };

  // Assessment Get by User
  const getUserAssessPath = spec.paths['/assess/user/{userId}'].get;
  getUserAssessPath.responses['200'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'User assessment',
          value: {
            success: true,
            data: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              userId: '550e8400-e29b-41d4-a716-446655440000',
              age: 30,
              goal: 'WEALTH_CREATION',
              riskBehavior: 'HIGH_RISK',
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z'
            }
          }
        }
      }
    }
  };

  // Portfolio Get by ID
  const getPortfolioPath = spec.paths['/portfolio/{id}'].get;
  getPortfolioPath.responses['200'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'Portfolio found',
          value: {
            success: true,
            data: {
              id: '550e8400-e29b-41d4-a716-446655440002',
              userId: '550e8400-e29b-41d4-a716-446655440000',
              assessmentId: '550e8400-e29b-41d4-a716-446655440001',
              name: 'Retirement Portfolio',
              description: 'Long-term retirement savings',
              totalValue: 1500000,
              createdAt: '2024-01-15T10:45:00.000Z',
              updatedAt: '2024-01-15T10:45:00.000Z'
            }
          }
        }
      }
    }
  };

  // Portfolio Get by User
  const getUserPortfoliosPath = spec.paths['/portfolio/user/{userId}'].get;
  getUserPortfoliosPath.responses['200'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'User portfolios',
          value: {
            success: true,
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440002',
                userId: '550e8400-e29b-41d4-a716-446655440000',
                assessmentId: '550e8400-e29b-41d4-a716-446655440001',
                name: 'Retirement Portfolio',
                description: 'Long-term retirement savings',
                totalValue: 1500000,
                createdAt: '2024-01-15T10:45:00.000Z',
                updatedAt: '2024-01-15T10:45:00.000Z'
              }
            ]
          }
        }
      }
    }
  };

  // Score Get by Portfolio
  const getScoresPath = spec.paths['/score/portfolio/{portfolioId}'].get;
  getScoresPath.responses['200'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'Portfolio scores',
          value: {
            success: true,
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440003',
                portfolioId: '550e8400-e29b-41d4-a716-446655440002',
                total: 85,
                goalAlignment: 90,
                assetAlloc: 80,
                diversification: 85,
                discipline: 88,
                efficiency: 82,
                tag: 'OPTIMIZED',
                insights: 'Well-diversified portfolio with good goal alignment.',
                createdAt: '2024-01-15T11:00:00.000Z',
                updatedAt: '2024-01-15T11:00:00.000Z'
              }
            ]
          }
        }
      }
    }
  };

  // Leads My Bookings
  const myBookingsPath = spec.paths['/leads/my-bookings'].get;
  myBookingsPath.responses['200'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'User bookings',
          value: {
            success: true,
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440007',
                userId: '550e8400-e29b-41d4-a716-446655440000',
                preferredSlot1: '2024-01-22T10:00:00.000Z',
                preferredSlot2: '2024-01-22T14:00:00.000Z',
                preferredSlot3: '2024-01-23T10:00:00.000Z',
                confirmedSlot: '2024-01-22T10:00:00.000Z',
                googleMeetLink: 'https://meet.google.com/abc-defg-hij',
                status: 'CONFIRMED',
                createdAt: '2024-01-15T11:35:00.000Z',
                updatedAt: '2024-01-15T11:35:00.000Z'
              }
            ]
          }
        }
      }
    }
  };

  // Leads My Sessions
  const mySessionsPath = spec.paths['/leads/my-sessions'].get;
  mySessionsPath.responses['200'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'User sessions',
          value: {
            success: true,
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440007',
                userId: '550e8400-e29b-41d4-a716-446655440000',
                preferredSlot1: '2024-01-22T10:00:00.000Z',
                preferredSlot2: '2024-01-22T14:00:00.000Z',
                preferredSlot3: '2024-01-23T10:00:00.000Z',
                confirmedSlot: '2024-01-22T10:00:00.000Z',
                googleMeetLink: 'https://meet.google.com/abc-defg-hij',
                status: 'CONFIRMED',
                createdAt: '2024-01-15T11:35:00.000Z',
                updatedAt: '2024-01-15T11:35:00.000Z'
              }
            ]
          }
        }
      }
    }
  };

  // Admin Sessions
  const adminSessionsPath = spec.paths['/leads/admin/sessions'].get;
  adminSessionsPath.responses['200'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'All sessions',
          value: {
            success: true,
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440007',
                userId: '550e8400-e29b-41d4-a716-446655440000',
                user: { id: '550e8400-e29b-41d4-a716-446655440000', email: 'john.doe@example.com', name: 'John Doe' },
                preferredSlot1: '2024-01-22T10:00:00.000Z',
                preferredSlot2: '2024-01-22T14:00:00.000Z',
                preferredSlot3: '2024-01-23T10:00:00.000Z',
                confirmedSlot: '2024-01-22T10:00:00.000Z',
                googleMeetLink: 'https://meet.google.com/abc-defg-hij',
                status: 'CONFIRMED',
                createdAt: '2024-01-15T11:35:00.000Z',
                updatedAt: '2024-01-15T11:35:00.000Z'
              }
            ]
          }
        }
      }
    }
  };

  // Admin Leads
  const adminLeadsPath = spec.paths['/admin/leads'].get;
  adminLeadsPath.responses['200'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'Admin leads with counts',
          value: {
            success: true,
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440004',
                userId: '550e8400-e29b-41d4-a716-446655440000',
                user: { id: '550e8400-e29b-41d4-a716-446655440000', email: 'john.doe@example.com', name: 'John Doe' },
                name: 'Jane Smith',
                phone: '+1-555-0456',
                scoreId: '550e8400-e29b-41d4-a716-446655440003',
                slot: '2024-01-20T14:00:00.000Z',
                status: 'NEW',
                createdAt: '2024-01-15T11:30:00.000Z',
                updatedAt: '2024-01-15T11:30:00.000Z'
              }
            ]
          }
        }
      }
    }
  };

  // Admin Existing Clients
  const adminClientsPath = spec.paths['/admin/existing-clients'].get;
  adminClientsPath.responses['200'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'Existing clients',
          value: {
            success: true,
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440008',
                name: 'Existing Client',
                pan: 'ABCDE1234F',
                email: 'client@example.com',
                mobile: '+1-555-1111',
                city: 'Mumbai',
                aum: 5000000,
                purchaseValue: 4500000,
                createdAt: '2024-01-10T09:00:00.000Z',
                updatedAt: '2024-01-10T09:00:00.000Z',
                folios: [
                  {
                    id: '550e8400-e29b-41d4-a716-446655440009',
                    clientName: 'Existing Client',
                    clientPan: 'ABCDE1234F',
                    email: 'client@example.com',
                    mobile: '+1-555-1111',
                    folioNumber: '1234567890',
                    schemeName: 'HDFC Equity Fund',
                    aum: 2500000,
                    purchaseValue: 2250000,
                    createdAt: '2024-01-10T09:05:00.000Z',
                    updatedAt: '2024-01-10T09:05:00.000Z'
                  }
                ]
              }
            ]
          }
        }
      }
    }
  };

  // Chat
  const chatPath = spec.paths['/chat'].post;
  chatPath.requestBody.content['application/json'].examples = {
    valid: {
      summary: 'Chat message',
      value: {
        message: 'What is the best mutual fund for long-term investment?',
        context: 'User is 30 years old, moderate risk appetite'
      }
    }
  };
  chatPath.responses['200'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'AI response',
          value: {
            success: true,
            data: {
              response: 'For long-term investment with moderate risk, consider diversified equity funds...',
              suggestions: ['HDFC Flexi Cap Fund', 'Parag Parikh Flexi Cap Fund', 'UTI Nifty 50 Index Fund']
            }
          }
        }
      }
    }
  };

  // Support Get
  const getSupportPath = spec.paths['/support'].get;
  getSupportPath.responses['200'].content = {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      examples: {
        success: {
          summary: 'User support queries',
          value: {
            success: true,
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440006',
                userId: '550e8400-e29b-41d4-a716-446655440000',
                subject: 'Unable to access portfolio',
                message: 'I cannot view my portfolio dashboard after login.',
                priority: 'HIGH',
                status: 'OPEN',
                createdAt: '2024-01-15T12:00:00.000Z',
                updatedAt: '2024-01-15T12:00:00.000Z'
              }
            ]
          }
        }
      }
    }
  };

  // Error response examples (add to common responses)
  Object.values(spec.components.responses).forEach((resp: any) => {
    if (resp.content?.['application/json']?.schema?.$ref === '#/components/schemas/ErrorResponse') {
      resp.content['application/json'].examples = {
        validationError: {
          summary: 'Validation error',
          value: {
            type: 'https://tools.ietf.org/html/rfc7807#section-3.1',
            title: 'Validation Error',
            status: 400,
            detail: 'email: Invalid email format',
            instance: '/auth/login'
          }
        },
        unauthorized: {
          summary: 'Unauthorized',
          value: {
            type: 'https://tools.ietf.org/html/rfc7807#section-3.1',
            title: 'Unauthorized',
            status: 401,
            detail: 'Invalid or expired token',
            instance: '/portfolio'
          }
        },
        notFound: {
          summary: 'Not found',
          value: {
            type: 'https://tools.ietf.org/html/rfc7807#section-3.1',
            title: 'Not Found',
            status: 404,
            detail: 'Portfolio not found',
            instance: '/portfolio/550e8400-e29b-41d4-a716-446655440002'
          }
        }
      };
    }
  });

  // Update server URL to include /api/v1 prefix
  spec.servers = [
    { url: '/api/v1', description: 'Current API version' },
    { url: '/api', description: 'Legacy API (deprecated)' }
  ];

  // Add info description
  spec.info.description = 'FinAnalysis API - Financial analysis and advisory platform. All endpoints are prefixed with `/api/v1`. Uses RFC 7807 Problem Details for errors.';

  fs.writeFileSync(openApiPath, JSON.stringify(spec, null, 2));
  console.log('OpenAPI examples added successfully!');
}

addExamples();