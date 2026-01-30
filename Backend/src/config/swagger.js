const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jarvis AI API',
      version: '1.0.0',
      description: `
# Jarvis AI Backend API Documentation

A powerful AI chat application API that provides:
- **User Authentication** - Register, login, logout with JWT tokens
- **OAuth Integration** - Sign in with Google and GitHub
- **Chat Management** - Create, rename, delete chats
- **Real-time Messaging** - Socket.io powered AI conversations
- **User Profiles** - View and update user information

## Authentication
All protected endpoints require a JWT token sent via cookie. The token is automatically set when logging in or registering.

## Base URL
- **Production**: https://chatai-vlcv.onrender.com
- **Development**: http://localhost:3000
      `,
      contact: {
        name: 'Ritesh Giri',
        email: 'rgiri5001@gmail.com',
        url: 'https://jarvisai.riteshgiri.dev'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://chatai-vlcv.onrender.com',
        description: 'Production Server'
      },
      {
        url: 'http://localhost:3000',
        description: 'Development Server'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints (register, login, logout, OAuth)'
      },
      {
        name: 'Profile',
        description: 'User profile management'
      },
      {
        name: 'Chats',
        description: 'Chat management endpoints'
      },
      {
        name: 'Messages',
        description: 'Message operations within chats'
      },
      {
        name: 'Health',
        description: 'Server health check'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in cookie'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier',
              example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com'
            },
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Doe'
            },
            googleId: {
              type: 'string',
              nullable: true,
              description: 'Google OAuth ID if linked'
            },
            githubId: {
              type: 'string',
              nullable: true,
              description: 'GitHub OAuth ID if linked'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            }
          }
        },
        Chat: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique chat identifier'
            },
            title: {
              type: 'string',
              description: 'Chat title',
              example: 'My first conversation'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'Owner user ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Message: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique message identifier'
            },
            content: {
              type: 'string',
              description: 'Message content',
              example: 'Hello, how can I help you?'
            },
            role: {
              type: 'string',
              enum: ['user', 'assistant'],
              description: 'Message sender role'
            },
            chatId: {
              type: 'string',
              format: 'uuid',
              description: 'Parent chat ID'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'User ID who sent the message'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['fullName', 'email', 'password'],
          properties: {
            fullName: {
              type: 'object',
              required: ['firstName'],
              properties: {
                firstName: {
                  type: 'string',
                  minLength: 1,
                  example: 'John'
                },
                lastName: {
                  type: 'string',
                  example: 'Doe'
                }
              }
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'securePassword123'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            password: {
              type: 'string',
              example: 'securePassword123'
            }
          }
        },
        ProfileUpdateRequest: {
          type: 'object',
          required: ['firstName'],
          properties: {
            firstName: {
              type: 'string',
              minLength: 1,
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            }
          }
        },
        CreateChatRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              example: 'New Conversation'
            }
          }
        },
        RenameChatRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              example: 'Updated Chat Title'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Something went wrong'
            },
            error: {
              type: 'string',
              description: 'Detailed error (development only)'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Operation successful'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required or token invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                message: 'Unauthorized'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                message: 'Resource not found'
              }
            }
          }
        },
        BadRequestError: {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                message: 'Invalid request data'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                message: 'Internal server error'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/app.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
