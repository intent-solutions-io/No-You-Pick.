# Firebase Blaze Plan Upgrade Guide

**Created:** 2025-12-10
**Required for:** Cloud Functions deployment
**Status:** Action Required

---

## ⚠️ Action Required: Upgrade to Blaze Plan

Firebase Cloud Functions require the **Blaze (pay-as-you-go) plan**. The free Spark plan does not support Cloud Functions v2.

### Why Blaze Plan?

**Current Plan:** Spark (Free)
- ❌ No Cloud Functions support
- ❌ No Secret Manager
- ❌ No custom domains
- ✅ Firebase Hosting (limited bandwidth)
- ✅ Firestore (limited usage)

**Blaze Plan:** Pay-as-you-go
- ✅ Cloud Functions (2M invocations/month FREE)
- ✅ Secret Manager (included)
- ✅ Custom domains
- ✅ Firebase Hosting (10 GB storage FREE, $0.026/GB bandwidth)
- ✅ Firestore (generous free tier)
- ✅ Vertex AI (free tier included)

---

## 💰 Cost Estimate

### Expected Monthly Cost: ~$0-$5

**Cloud Functions (noupick-staging)**:
- Traffic: ~100-500 requests/day (testing/development)
- First 2M invocations: FREE
- **Estimated cost:** $0/month

**Cloud Functions (noupick-prod)**:
- Traffic: ~1,000 requests/day (100 users × 10 searches)
- ~30,000 requests/month
- First 2M free, so: **$0/month**

**Firebase Hosting**:
- Static files: <100 MB
- Bandwidth: ~1-2 GB/month
- First 10 GB storage: FREE
- First 360 MB/day bandwidth: FREE
- **Estimated cost:** $0/month

**Firestore**:
- Read operations: ~10,000/month (favorites, search history)
- Write operations: ~5,000/month
- First 50,000 reads: FREE
- **Estimated cost:** $0/month

**Vertex AI**:
- Model calls: ~1,000-2,000/month
- gemini-1.5-flash-002 pricing: Very low (fractions of a penny per request)
- **Estimated cost:** $0.50-$2/month

**Total Estimated:** **$0.50-$2/month** (mostly Vertex AI)

---

## 🚀 Upgrade Steps

### Option 1: Firebase Console (Recommended - Easiest)

1. **Open Firebase Console:**
   ```
   https://console.firebase.google.com/project/noupick-staging/usage/details
   ```

2. **Click "Modify Plan"**

3. **Select "Blaze Plan"**

4. **Link Billing Account:**
   - If you don't have one: Create new billing account
   - If you have one: Select existing billing account

5. **Set Budget Alert (Recommended):**
   - Go to: https://console.cloud.google.com/billing
   - Click "Budgets & alerts"
   - Create budget: $10/month
   - Set alert at: 50%, 90%, 100%

6. **Confirm Upgrade**

7. **Repeat for Production:**
   ```
   https://console.firebase.google.com/project/noupick-prod/usage/details
   ```

### Option 2: gcloud CLI

```bash
# This doesn't directly upgrade the plan, but you can link billing:
gcloud billing projects link noupick-staging \
  --billing-account=YOUR_BILLING_ACCOUNT_ID

gcloud billing projects link noupick-prod \
  --billing-account=YOUR_BILLING_ACCOUNT_ID

# Find your billing account ID:
gcloud billing accounts list
```

---

## 🛡️ Cost Protection

### Set Up Budget Alerts

**Recommended Budget:** $10/month per project

```bash
# Via GCP Console:
# 1. Go to: https://console.cloud.google.com/billing
# 2. Select your billing account
# 3. Click "Budgets & alerts"
# 4. Create budget:
#    - Name: "noupick-staging-budget"
#    - Budget type: Specified amount
#    - Amount: $10
#    - Alerts: 50%, 90%, 100%
#    - Email notifications: Your email
```

### Monitor Usage

**Real-time Monitoring:**
- Cloud Functions: https://console.firebase.google.com/project/noupick-staging/functions
- Vertex AI: https://console.cloud.google.com/vertex-ai/pricing
- Billing: https://console.cloud.google.com/billing

**Daily Reports:**
```bash
# Get current month's cost
gcloud billing projects describe noupick-staging \
  --format="value(billingAccountName)"

# View detailed billing
# Visit: https://console.cloud.google.com/billing/reports
```

---

## ✅ After Upgrade Checklist

Once both projects are on Blaze plan:

1. **Verify Billing is Active:**
   ```bash
   gcloud billing projects describe noupick-staging
   # Should show: billingEnabled: true
   ```

2. **Deploy to Staging:**
   ```bash
   firebase use staging
   firebase deploy --only functions --project=noupick-staging
   ```

3. **Test Cloud Functions:**
   ```bash
   # Health check
   curl https://us-central1-noupick-staging.cloudfunctions.net/health

   # Restaurant search
   curl -X POST https://us-central1-noupick-staging.cloudfunctions.net/api/restaurants \
     -H "Content-Type: application/json" \
     -d '{
       "locationQuery": "San Francisco, CA",
       "cuisine": "Pizza",
       "radius": "5"
     }'
   ```

4. **Verify Vertex AI Works:**
   - Check logs: `firebase functions:log --project=noupick-staging`
   - Look for successful Vertex AI API calls
   - Confirm no "API key" errors

5. **Deploy to Production:**
   ```bash
   firebase use production
   firebase deploy --only functions --project=noupick-prod
   ```

---

## 🔍 Troubleshooting

### "Billing account not linked"

**Solution:**
```bash
# Link billing account
gcloud billing projects link noupick-staging \
  --billing-account=XXXXXX-XXXXXX-XXXXXX
```

### "Quota exceeded"

**Solution:**
- Check quotas: https://console.cloud.google.com/iam-admin/quotas
- Request increase if needed
- Vertex AI quotas are usually sufficient for MVP

### "Deployment fails"

**Solution:**
```bash
# Enable required APIs manually
gcloud services enable cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  --project=noupick-staging
```

---

## 💡 Cost Optimization Tips

1. **Use minimum instances: 0**
   - Already configured in functions/src/index.ts
   - No idle costs

2. **Set appropriate memory:**
   - API function: 512 MiB (optimal)
   - Health check: 128 MiB (minimal)

3. **Enable caching:**
   - HTTP caching headers already set
   - Firebase Hosting CDN caching automatic

4. **Monitor and adjust:**
   - Review billing weekly for first month
   - Adjust rate limits if needed
   - Optimize Vertex AI calls

---

## 📚 References

- **Firebase Pricing:** https://firebase.google.com/pricing
- **Cloud Functions Pricing:** https://cloud.google.com/functions/pricing
- **Vertex AI Pricing:** https://cloud.google.com/vertex-ai/pricing
- **Budget Alerts:** https://cloud.google.com/billing/docs/how-to/budgets

---

## 🎯 Summary

**What You Need to Do:**

1. ✅ Upgrade noupick-staging to Blaze plan
2. ✅ Upgrade noupick-prod to Blaze plan
3. ✅ Set budget alerts ($10/month recommended)
4. ✅ Deploy Cloud Functions
5. ✅ Test Vertex AI integration

**Expected Cost:** $0.50-$2/month (mostly Vertex AI usage)

**Safety:** Budget alerts will notify you if costs approach $5/$10

---

**End of Blaze Plan Upgrade Guide**

*Created: 2025-12-10*
*Required: Yes - blocking Cloud Functions deployment*
*Expected Cost: <$2/month for MVP traffic*
