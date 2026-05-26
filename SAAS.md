# InsightFlow - Multi-Tenant SaaS Analytics Dashboard

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-18.x-green)
![React](https://img.shields.io/badge/react-18.x-blue)
![Tailwind](https://img.shields.io/badge/tailwind-3.3.x-06B6D4)
![License](https://img.shields.io/badge/license-MIT-green)

## 📖 About The Project

**InsightFlow** is a production-ready, multi-tenant Software-as-a-Service (SaaS) analytics dashboard that helps businesses track their performance metrics, manage subscriptions, and process payments via M-Pesa. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js), this platform demonstrates enterprise-grade security features including JWT authentication, OAuth2 social login, password reset flows, and role-based access control.

### 🎯 Why I Built This

This project showcases my ability to build scalable, secure, and monetizable SaaS applications. It solves real business problems by providing:

- **For Businesses**: Centralized analytics to track revenue, users, orders, and conversion rates
- **For Developers**: A reusable template with authentication, payments, and multi-tenancy already implemented
- **For Employers**: Proof of full-stack capabilities with M-Pesa integration (unique to Kenyan market)

### ✨ Key Features

#### 🔐 Authentication & Security
- JWT authentication with access & refresh tokens
- OAuth2 Google login (social authentication)
- bcrypt password hashing (12 rounds)
- Forgot password & reset password flow with email tokens
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- CORS configured for security

#### 💳 Payment Integration
- M-Pesa Daraja API integration (STK Push)
- Subscription billing (Monthly & Yearly plans)
- Automatic payment confirmation via webhooks
- Payment history tracking

#### 📊 Analytics Dashboard
- Real-time revenue tracking
- User growth metrics
- Order statistics
- Conversion rate monitoring
- Top products performance
- Traffic source analysis
- Data export to CSV

#### 🏢 Multi-Tenant Architecture
- Company/organization isolation
- Role-based access control (Owner, Admin, Viewer)
- Team member invitation system
- Tenant-specific settings and preferences

#### 💰 Subscription Plans
| Plan | Monthly | Yearly | Features |
|------|---------|--------|----------|
| Free | Ksh 0 | Ksh 0 | Basic analytics, 30-day retention, 1 user |
| Basic | Ksh 2,500 | Ksh 25,000 | 90-day retention, 3 users, real-time analytics |
| Pro | Ksh 7,500 | Ksh 75,000 | 1-year retention, 10 users, API access, data export |
| Enterprise | Ksh 25,000 | Ksh 250,000 | Unlimited everything, priority support |

#### 🛠️ Technical Features
- RESTful API with 25+ endpoints
- Zustand state management (minimal boilerplate)
- Responsive design with Tailwind CSS
- Recharts for beautiful data visualization
- React Router v6 for navigation
- Axios interceptors for token refresh

## 🏗️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x | Runtime environment |
| Express.js | 4.18.x | Web framework |
| MongoDB | 6.x | Database |
| Mongoose | 8.x | ODM |
| JWT | 9.x | Authentication |
| bcrypt | 5.x | Password hashing |
| Passport.js | 0.7.x | OAuth2 strategy |
| Nodemailer | 6.9.x | Email sending |
| Axios | 1.6.x | HTTP client (M-Pesa) |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.x | UI framework |
| Vite | 5.x | Build tool |
| Zustand | 4.4.x | State management |
| React Router | 6.20.x | Navigation |
| Tailwind CSS | 3.3.x | Styling |
| Recharts | 2.10.x | Charts |
| React Hot Toast | 2.4.x | Notifications |
| React Icons | 5.0.x | Icons |

## 📁 Project Structure
