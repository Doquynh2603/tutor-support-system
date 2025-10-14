/**
 * File: swagger.js
 * Mục đích: Cấu hình Swagger/OpenAPI documentation
 * Vai trò:
 *   - Tự động generate API documentation
 *   - Hỗ trợ test API trực tiếp trên UI
 * Lưu ý:
 *   - Swagger sẽ scan comments trong routes và models
 *   - Cần tuân thủ chuẩn JSDoc để Swagger nhận diện
 *   - Bearer token authentication đã được cấu hình
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tutor Support System API',
      version: '1.0.0',
      description: 'API documentation cho hệ thống hỗ trợ gia sư',
      contact: {
        name: 'API Support',
        email: 'support@tutorsystem.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Đường dẫn đến các file chứa Swagger comments
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
