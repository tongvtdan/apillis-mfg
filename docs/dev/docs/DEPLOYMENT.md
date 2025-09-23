# Factory Pulse - Vercel Deployment Guide

## Prerequisites

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Ensure your code is committed to Git:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   ```

## Step 1: Environment Variables Setup

### Get Your Supabase Credentials
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy your Project URL and anon/public key

### Set Environment Variables in Vercel
You can set these via CLI or Dashboard:

**Via CLI:**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

**Via Dashboard:**
1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Go to Settings > Environment Variables
4. Add the following variables:

| Variable                 | Value                                      | Environment         |
| ------------------------ | ------------------------------------------ | ------------------- |
| `VITE_SUPABASE_URL`      | `https://ynhgxwnkpbpzwbtzrzka.supabase.co` | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | Your actual anon key                       | Production, Preview |

## Step 2: Deploy to Vercel

### Option A: Deploy via CLI (Recommended)

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy from project directory:**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project or create new one
   - Confirm build settings (should auto-detect Vite)
   - Deploy to production: `vercel --prod`

### Option B: Deploy via GitHub Integration

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Connect in Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

## Step 3: Verify Deployment

### Test Your Deployment
1. **Check build logs** in Vercel dashboard
2. **Test core functionality:**
   - Authentication
   - Database connections
   - File uploads
   - All major features

### Common Issues & Solutions

**Build Failures:**
- Check that all dependencies are in `package.json`
- Verify environment variables are set correctly
- Run `npm run build` locally to test

**Supabase Connection Issues:**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase project is active and accessible
- Ensure RLS policies allow public access where needed

**File Upload Issues:**
- Verify Supabase storage bucket configuration
- Check CORS settings in Supabase
- Ensure storage policies are properly configured

## Step 4: Production Optimization

### Performance Monitoring
- Enable Vercel Analytics
- Monitor Core Web Vitals
- Set up error tracking

### Security Checklist
- [ ] Environment variables are secure
- [ ] Supabase RLS policies are properly configured
- [ ] No sensitive data in client-side code
- [ ] HTTPS is enforced

## Deployment Commands Reference

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]
```

## Environment Variables Reference

| Variable                    | Description                  | Required |
| --------------------------- | ---------------------------- | -------- |
| `VITE_SUPABASE_URL`         | Your Supabase project URL    | Yes      |
| `VITE_SUPABASE_ANON_KEY`    | Supabase anonymous key       | Yes      |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (if needed) | No       |
| `NODE_ENV`                  | Set to 'production'          | Auto     |

## Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] Authentication works
- [ ] Database queries succeed
- [ ] File uploads work
- [ ] All major features functional
- [ ] Performance is acceptable
- [ ] Error tracking is working
- [ ] Analytics are collecting data

## Troubleshooting

### Build Issues
```bash
# Test build locally
npm run build
npm run preview

# Check for TypeScript errors
npm run lint
```

### Environment Issues
```bash
# Verify environment variables
vercel env ls

# Update environment variables
vercel env add VARIABLE_NAME
```

### Database Issues
- Check Supabase project status
- Verify RLS policies
- Test database connection from Supabase dashboard
