# Vertex AI Migration Plan - From Gemini API to Vertex AI

**Created:** 2025-12-10
**Status:** Planning
**Priority:** HIGH - Better architecture than current implementation

---

## 🎯 Problem Statement

**Current Implementation:**
- Using `@google/genai` (Gemini API SDK)
- Requires API key stored in Secret Manager
- Authentication via API key (less secure)
- Limited to Gemini API features

**DiagnosticPro Pattern:**
- Using `@google-cloud/vertexai` (Vertex AI SDK)
- NO API KEY REQUIRED - uses Workload Identity Federation (WIF)
- Authentication via Application Default Credentials (ADC)
- Full Vertex AI ecosystem access

---

## 📊 Comparison: Gemini API vs Vertex AI

| Aspect | Current (Gemini API) | Proposed (Vertex AI) |
|--------|---------------------|---------------------|
| **Package** | `@google/genai` | `@google-cloud/vertexai` |
| **Authentication** | API key (Secret Manager) | WIF / ADC (no secrets!) |
| **Setup Complexity** | Medium (manage API keys) | Low (automatic with GCP) |
| **Security** | Good (Secret Manager) | **Better (no secrets)** |
| **GitHub Actions** | Needs API key secret | WIF (keyless deployment) |
| **Cost** | Charged per request | Same pricing, better quotas |
| **Integration** | Standalone API | Full GCP ecosystem |
| **Models** | Gemini only | Vertex AI + Gemini |
| **Free Tier** | Limited | **More generous** |

---

## 🔍 Code Comparison

### Current Implementation (Gemini API)

**functions/src/index.ts:**
```typescript
import { GoogleGenAI } from "@google/genai";
import { defineSecret } from "firebase-functions/params";

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

export const api = onRequest(
  { secrets: [GEMINI_API_KEY], ... },
  async (request, response) => {
    // Need API key
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 1.2,
        tools: [{ googleMaps: {} }],
      },
    });
  }
);
```

**package.json:**
```json
{
  "dependencies": {
    "@google/genai": "^1.30.0",
    "firebase-functions": "^5.0.0"
  }
}
```

### Proposed Implementation (Vertex AI)

**functions/src/index.ts:**
```typescript
import { VertexAI } from "@google-cloud/vertexai";

// NO SECRET NEEDED!

export const api = onRequest(
  { region: "us-central1", ... },
  async (request, response) => {
    // Automatic authentication via ADC
    const project = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
    const location = "us-central1";

    const vertex = new VertexAI({ project, location });
    const model = vertex.getGenerativeModel({ model: "gemini-1.5-flash-002" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
  }
);
```

**package.json:**
```json
{
  "dependencies": {
    "@google-cloud/vertexai": "^1.9.0",
    "firebase-functions": "^6.4.0"
  }
}
```

---

## 🚀 Migration Steps

### Phase 1: Update Dependencies

```bash
cd functions

# Remove old package
npm uninstall @google/genai

# Install Vertex AI SDK
npm install @google-cloud/vertexai@^1.9.0

# Update Firebase Functions to v6
npm install firebase-functions@^6.4.0
```

### Phase 2: Refactor Cloud Functions

**Changes to `functions/src/index.ts`:**

1. **Replace import:**
```typescript
// OLD
import { GoogleGenAI } from "@google/genai";
import { defineSecret } from "firebase-functions/params";
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

// NEW
import { VertexAI } from "@google-cloud/vertexai";
```

2. **Remove secret from function config:**
```typescript
// OLD
export const api = onRequest(
  {
    secrets: [GEMINI_API_KEY],  // REMOVE THIS
    region: "us-central1",
    ...
  },

// NEW
export const api = onRequest(
  {
    region: "us-central1",  // No secrets needed!
    ...
  },
```

3. **Update AI initialization:**
```typescript
// OLD
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });
const result = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
  config: { temperature: 1.2, tools: [{ googleMaps: {} }] }
});

// NEW
const project = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
const location = "us-central1";
const vertex = new VertexAI({ project, location });
const model = vertex.getGenerativeModel({
  model: "gemini-1.5-flash-002"  // Note: Vertex uses different model names
});

const result = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: prompt }] }]
});
```

4. **Update response parsing:**
```typescript
// OLD
const text = result.text || "";
const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

// NEW
const text = result.response?.candidates?.[0]?.content?.parts?.map(p => (p as any).text || "").join("\n") || "";
const chunks = result.response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
```

### Phase 3: Remove Secret Manager Configuration

```bash
# No need to create GEMINI_API_KEY secret!
# No need to configure IAM bindings!
# Vertex AI uses Application Default Credentials automatically
```

**Delete these steps from deployment guide:**
- ❌ Create GEMINI_API_KEY secret
- ❌ Grant secret accessor role
- ❌ Manage API key rotation

### Phase 4: Set Up Workload Identity Federation (GitHub Actions)

**Create `.github/workflows/deploy.yml`:**
```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  id-token: write  # Required for WIF

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: 'projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider'
          service_account: 'github-deployer@noupick-prod.iam.gserviceaccount.com'

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build frontend
        run: npm run build

      - name: Build functions
        run: cd functions && npm ci && npm run build && cd ..

      - name: Deploy to Firebase
        run: firebase deploy --only hosting,functions --project=noupick-prod
```

### Phase 5: Configure WIF in GCP

```bash
# 1. Enable required APIs
gcloud services enable iamcredentials.googleapis.com \
  --project=noupick-prod

# 2. Create Workload Identity Pool
gcloud iam workload-identity-pools create github-pool \
  --location=global \
  --display-name="GitHub Actions Pool" \
  --project=noupick-prod

# 3. Create Provider
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location=global \
  --workload-identity-pool=github-pool \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --project=noupick-prod

# 4. Create Service Account
gcloud iam service-accounts create github-deployer \
  --display-name="GitHub Actions Deployer" \
  --project=noupick-prod

# 5. Grant Permissions
gcloud projects add-iam-policy-binding noupick-prod \
  --member="serviceAccount:github-deployer@noupick-prod.iam.gserviceaccount.com" \
  --role="roles/firebase.admin"

gcloud projects add-iam-policy-binding noupick-prod \
  --member="serviceAccount:github-deployer@noupick-prod.iam.gserviceaccount.com" \
  --role="roles/cloudfunctions.developer"

# 6. Allow GitHub to impersonate service account
gcloud iam service-accounts add-iam-policy-binding \
  github-deployer@noupick-prod.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/YOUR_GITHUB_ORG/noupick" \
  --project=noupick-prod
```

### Phase 6: Update Documentation

**Files to update:**
- `000-docs/007-DEPLOY-production-deployment-guide.md` - Remove Secret Manager steps
- `README.md` - Update architecture diagram
- `.env.example` - Remove VITE_GEMINI_API_KEY (not needed)
- `functions/.env.example` - Remove GEMINI_API_KEY (not needed)

---

## ✅ Benefits of Migration

### Security Improvements
- ✅ **NO API KEYS** - Zero secret management for Google services
- ✅ **WIF Authentication** - Industry best practice (used by GitHub, GitLab, etc.)
- ✅ **Automatic Credential Rotation** - ADC handles this
- ✅ **Principle of Least Privilege** - Fine-grained IAM roles

### Operational Improvements
- ✅ **Simpler Deployment** - No secret configuration needed
- ✅ **Better CI/CD** - GitHub Actions with keyless auth
- ✅ **Lower Maintenance** - No API key rotation required
- ✅ **Audit Trail** - Better GCP audit logs

### Cost & Performance
- ✅ **Same Pricing** - Vertex AI uses same Gemini models
- ✅ **Better Quotas** - Vertex AI has higher free tier
- ✅ **Regional Deployment** - Better latency options

---

## 📋 Migration Checklist

### Pre-Migration
- [ ] Review DiagnosticPro implementation (completed ✅)
- [ ] Document current Gemini API usage
- [ ] Backup current deployment
- [ ] Test Vertex AI in development

### Code Changes
- [ ] Update `functions/package.json` dependencies
- [ ] Refactor `functions/src/index.ts` to use Vertex AI
- [ ] Update response parsing logic
- [ ] Remove Secret Manager references
- [ ] Update TypeScript types

### Infrastructure
- [ ] Enable Vertex AI API in GCP
- [ ] Create Workload Identity Pool
- [ ] Create GitHub provider
- [ ] Create service account
- [ ] Configure IAM bindings
- [ ] Test WIF authentication

### Deployment
- [ ] Deploy to staging with Vertex AI
- [ ] Verify restaurant search works
- [ ] Test rate limiting
- [ ] Check error handling
- [ ] Deploy to production
- [ ] Remove old API key from Secret Manager

### Documentation
- [ ] Update deployment guide
- [ ] Update README architecture
- [ ] Update .env.example files
- [ ] Create GitHub Actions workflow
- [ ] Document WIF setup process

---

## 🎯 Recommendation

**PROCEED WITH MIGRATION** for the following reasons:

1. **Security First:** No API keys = no secret leakage risk
2. **Best Practice:** WIF is industry standard (DiagnosticPro, Google, GitHub)
3. **Operational Excellence:** Simpler deployment, less maintenance
4. **Cost Effective:** Same or lower cost with Vertex AI
5. **Future Proof:** Better GCP ecosystem integration

**Estimated Effort:**
- Code changes: 2-3 hours
- WIF setup: 1-2 hours
- Testing: 1-2 hours
- Documentation: 1 hour
- **Total: 5-8 hours**

**Risk Level:** LOW
- Vertex AI is proven (DiagnosticPro uses it)
- Same Gemini models, just different SDK
- Easy rollback if needed

---

## 🔄 Rollback Plan

If migration fails:

1. **Revert code changes:**
   ```bash
   git revert <commit-hash>
   git push
   ```

2. **Redeploy old version:**
   ```bash
   firebase deploy --only functions --project=noupick-prod
   ```

3. **Reconfigure API key:**
   ```bash
   # Re-create GEMINI_API_KEY secret if deleted
   echo -n "API_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=-
   ```

---

## 📚 References

### DiagnosticPro Examples
- `diagnostic-platform/DiagnosticPro/functions/src/index.ts` - Vertex AI usage
- `diagnostic-platform/DiagnosticPro/.github/workflows/deploy-cloudrun.yml` - WIF setup
- `diagnostic-platform/DiagnosticPro/functions/package.json` - Dependencies

### Google Documentation
- Vertex AI SDK: https://cloud.google.com/vertex-ai/docs/generative-ai/start/quickstarts/quickstart-multimodal
- Workload Identity Federation: https://cloud.google.com/iam/docs/workload-identity-federation
- GitHub Actions Auth: https://github.com/google-github-actions/auth

### Model Mapping
- Gemini API: `gemini-2.5-flash` → Vertex AI: `gemini-1.5-flash-002`
- Gemini API: `gemini-2.5-pro` → Vertex AI: `gemini-1.5-pro-002`

---

**End of Migration Plan**

*Created: 2025-12-10*
*Status: Ready for implementation*
*Priority: HIGH - Better than current Secret Manager approach*
