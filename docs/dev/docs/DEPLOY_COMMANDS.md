# Quick Deployment Commands

## Install Vercel CLI
```bash
npm i -g vercel
```

## Login to Vercel
```bash
vercel login
```

## Deploy to Preview
```bash
vercel
```

## Deploy to Production
```bash
vercel --prod
```

## Set Environment Variables
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

## Run Automated Deployment Script
```bash
./deploy-vercel.sh
```

## Check Deployment Status
```bash
vercel ls
```

## View Logs
```bash
vercel logs [deployment-url]
```
