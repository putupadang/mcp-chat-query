# Deployment Guide

This guide covers deploying the MCP Portfolio project to various platforms.

## Prerequisites

- GitHub account
- Domain name (optional)
- Account on deployment platform (Vercel, Railway, Cloud Run, etc.)

## Option 1: Deploy to Vercel (Next.js App)

### Step 1: Prepare the App

1. Ensure your code is pushed to GitHub
2. Make sure `app/package.json` has build scripts

### Step 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:

   - **Framework Preset**: Next.js
   - **Root Directory**: `app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add environment variables:

   ```
   NEXT_PUBLIC_MCP_SERVER_URL=https://your-server-url.com
   MCP_API_KEY=your-production-api-key
   ```

6. Click "Deploy"

### Step 3: Verify Deployment

Visit your Vercel URL: `https://your-app.vercel.app`

## Option 2: Deploy Server to Cloud Run (GCP)

### Prerequisites

- Google Cloud Project
- gcloud CLI installed

### Step 1: Build and Push Container

```bash
# Authenticate
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Build image
docker build -t gcr.io/YOUR_PROJECT_ID/mcp-server ./server

# Push to Container Registry
docker push gcr.io/YOUR_PROJECT_ID/mcp-server
```

### Step 2: Deploy to Cloud Run

```bash
gcloud run deploy mcp-server \
  --image gcr.io/YOUR_PROJECT_ID/mcp-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars APP_API_KEY=your-secret-key,NODE_ENV=production \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1
```

### Step 3: Get Service URL

```bash
gcloud run services describe mcp-server \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'
```

## Option 3: Deploy to Railway

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login and Initialize

```bash
railway login
railway init
```

### Step 3: Deploy Server

```bash
cd server
railway up
railway variables set APP_API_KEY=your-secret-key
railway domain  # Get your domain
```

### Step 4: Deploy Frontend

```bash
cd ../app
railway up
railway variables set NEXT_PUBLIC_MCP_SERVER_URL=https://your-server.railway.app
railway variables set MCP_API_KEY=your-secret-key
```

## Option 4: Deploy with Docker Compose (VPS)

### Prerequisites

- VPS with Docker installed (DigitalOcean, Linode, etc.)
- Domain name pointed to VPS IP

### Step 1: SSH into VPS

```bash
ssh user@your-vps-ip
```

### Step 2: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y
```

### Step 3: Clone and Configure

```bash
git clone https://github.com/YOUR_USERNAME/mcp-portfolio.git
cd mcp-portfolio

# Create .env file
cat > .env << EOF
APP_API_KEY=your-production-secret-key
EOF
```

### Step 4: Deploy

```bash
sudo docker-compose up -d

# View logs
sudo docker-compose logs -f

# Check status
sudo docker-compose ps
```

### Step 5: Setup Nginx Reverse Proxy

```bash
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/mcp-portfolio
```

Add this configuration:

```nginx
# Server
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# App
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/mcp-portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

## Environment Variables Reference

### Server (.env)

```bash
# Server Configuration
PORT=4000
NODE_ENV=production

# Security
APP_API_KEY=your-production-secret-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Logging
LOG_LEVEL=info
```

### App (.env.local)

```bash
# MCP Server
NEXT_PUBLIC_MCP_SERVER_URL=https://api.yourdomain.com
MCP_API_KEY=your-production-secret-key
```

## GitHub Actions Secrets

Add these secrets in your GitHub repository settings:

```
VERCEL_TOKEN           # For Vercel deployment
VERCEL_ORG_ID         # Your Vercel org ID
VERCEL_PROJECT_ID     # Your Vercel project ID
GCP_SA_KEY            # GCP service account key (JSON)
CLOUD_RUN_PROJECT     # GCP project ID
APP_API_KEY           # Production API key
MCP_SERVER_URL        # Production server URL
```

## Monitoring & Maintenance

### Health Checks

```bash
# Server health
curl https://api.yourdomain.com/admin/health

# Check logs
docker-compose logs --tail=100 mcp-server
docker-compose logs --tail=100 mcp-app
```

### Backup Strategy

```bash
# Backup Docker volumes
docker run --rm \
  --volumes-from mcp-server \
  -v $(pwd):/backup \
  ubuntu tar cvf /backup/backup.tar /app

# Automated backups (cron)
0 2 * * * /path/to/backup-script.sh
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Troubleshooting

### Server won't start

```bash
# Check logs
docker-compose logs mcp-server

# Common issues:
# - Missing environment variables
# - Port already in use
# - Invalid API key format
```

### High memory usage

```bash
# Check memory
docker stats

# Restart services
docker-compose restart

# Limit memory in docker-compose.yml
services:
  mcp-server:
    mem_limit: 512m
```

### CORS errors

Add your frontend domain to `ALLOWED_ORIGINS`:

```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Performance Tuning

### Production Optimization

1. **Enable Caching**:

   - Add Redis for caching
   - Enable CDN for static assets

2. **Database Connection Pooling**:

   - Use connection pools
   - Implement query optimization

3. **Horizontal Scaling**:

   - Run multiple server instances
   - Add load balancer

4. **Monitoring**:
   - Set up Datadog/New Relic
   - Configure alerts

## Cost Estimation

### Vercel (Free Tier)

- **Frontend**: Free for hobby projects
- **Bandwidth**: 100GB/month
- **Builds**: Unlimited

### Cloud Run

- **Server**: ~$5-20/month (depending on traffic)
- **First 2M requests**: Free
- **Memory**: 512MB included

### VPS (DigitalOcean)

- **Basic Droplet**: $6/month
- **Includes**: 1GB RAM, 25GB SSD, 1TB transfer

## Next Steps

1. Set up custom domain
2. Configure SSL certificates
3. Enable monitoring
4. Set up automated backups
5. Configure CDN
6. Implement caching strategy
