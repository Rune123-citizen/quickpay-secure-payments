# PayFlow - Digital Payments Platform

A comprehensive PhonePe-style digital payments platform built with microservices architecture, supporting UPI payments, bill payments, money transfers, and more.

## 🚀 Quick Start

### Frontend Only (Demo Mode)
The frontend application can run independently with mock data when backend services are not available:

```bash
npm install
npm run dev
```

The app will be available at http://localhost:8080

**Demo Credentials:**
- Email: demo@payflow.com
- Password: any password (will work in demo mode)

### Full Development Environment

#### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Make (optional, for convenience commands)

#### 1. Clone the repository:
```bash
git clone <repository-url>
cd payflow
```

#### 2. Start the development environment:
```bash
make dev
# OR
docker-compose up --build
```

#### 3. Access the services:
- Web App: http://localhost:5173
- Auth Service: http://localhost:3001
- User Service: http://localhost:3002
- Transaction Service: http://localhost:3003
- API Documentation: http://localhost:3001/api/docs

## 🏗️ Architecture

### Microservices

| Service | Port | Technology | Purpose |
|---------|------|------------|---------|
| auth-svc | 3001 | NestJS | Authentication & Authorization |
| user-svc | 3002 | NestJS | User Management & KYC |
| txn-svc | 3003 | Go | Transaction Processing |
| balance-svc | 3005 | Kotlin | Balance Management |
| notif-svc | 3004 | Node.js | Notifications (SMS/Email) |
| ledger-svc | 3006 | Rust | Double-entry Ledger |

### Infrastructure

- **Database**: PostgreSQL (primary), MongoDB (notifications)
- **Cache**: Redis
- **Message Queue**: Apache Kafka
- **Secrets**: HashiCorp Vault
- **API Gateway**: Istio (production)

## 🔐 Security Features

- **JWT-based authentication** with refresh tokens
- **OTP verification** via SMS/WhatsApp
- **Rate limiting** and brute-force protection
- **UPI PIN encryption** using Vault/HSM
- **PCI DSS 4.0** and **RBI compliance**
- **End-to-end encryption** for sensitive data

## 📱 Features

### Core Features
- ✅ Phone number registration with OTP
- ✅ Secure login/logout with session management
- ✅ UPI PIN creation and verification
- ✅ Money transfer (P2P, P2M)
- ✅ Bank account linking
- ✅ Balance check
- ✅ Transaction history
- ✅ QR code payments

### Additional Features
- 🔄 Bill payments (electricity, mobile, DTH)
- 🔄 Mobile recharge
- 🔄 KYC verification (Tier I & II)
- 🔄 Admin dashboard
- 🔄 Risk management & fraud detection

## 🧪 Testing

```bash
# Run all tests
make test

# Run unit tests only
make test-unit

# Run specific service tests
cd services/auth-svc && npm test
```

## 📊 Monitoring

Access monitoring dashboards:
- **Logs**: `make logs`
- **Metrics**: http://localhost:3000/metrics (Prometheus format)
- **Health**: http://localhost:3001/health

## 🚀 Deployment

### Demo Mode (Frontend Only)
The application is deployed at: https://musical-otter-692040.netlify.app

This deployment runs in demo mode with mock data since the backend microservices are not deployed.

### Staging
```bash
make deploy-staging
```

### Production
```bash
make deploy-prod
```

## 🛠️ Development

### Frontend Development
The frontend is built with:
- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **shadcn/ui** for components
- **React Query** for API state management

### Adding a New Service

1. Create service directory: `services/new-svc/`
2. Add to `docker-compose.yaml`
3. Update API gateway routing
4. Add monitoring and logging

### Database Migrations

```bash
make db-migrate
```

### Environment Variables

Key environment variables for each service:

**Auth Service:**
- `JWT_SECRET`: JWT signing secret
- `REDIS_URL`: Redis connection string
- `OTP_SERVICE_URL`: Notification service URL

**Transaction Service:**
- `DATABASE_URL`: PostgreSQL connection
- `VAULT_ADDR`: Vault server address
- `KAFKA_BROKER`: Kafka broker address

## 📚 API Documentation

- Auth Service: http://localhost:3001/api/docs
- User Service: http://localhost:3002/api/docs
- Transaction Service: http://localhost:3003/swagger

## 🔧 Troubleshooting

### Common Issues

1. **Services not starting**: Check if ports are available
2. **Database connection errors**: Ensure PostgreSQL is running
3. **Kafka connection issues**: Wait for Kafka to fully initialize
4. **Network errors in frontend**: Backend services may not be running - app will use mock data

### Demo Mode
When backend services are not available, the frontend automatically switches to demo mode with:
- Mock authentication (any credentials will work)
- Sample transaction data
- Simulated balance information
- Mock payment flows

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
```

## 📞 Support

For issues and support:
1. Check the troubleshooting guide
2. Review service logs
3. Open an issue in the repository

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Current Status

**Frontend**: ✅ Complete and deployed
- Modern React 18 application
- Responsive design
- Authentication flows
- Payment interfaces
- Transaction history
- Balance management

**Backend Services**: 🔄 In Development
- Microservices architecture defined
- Docker configurations ready
- API specifications documented
- Database schemas designed

**Infrastructure**: 🔄 Planned
- Kubernetes deployment configs
- Terraform infrastructure scripts
- CI/CD pipelines
- Monitoring and observability

The application currently runs in demo mode with mock data, providing a full user experience while the backend services are being developed.