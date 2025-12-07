# No, You Pick! 🦊🍕

> **The Argument Ender** - AI-powered restaurant picker that chooses 3 random spots so you don't have to fight about it.

[![Made with React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Powered by Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Built with Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

<div align="center">
<img width="1200" height="475" alt="No You Pick Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

---

## 🎯 What It Does

Can't decide where to eat with friends or family? **No-You-Pick** uses Google Gemini AI with real-time Maps data to instantly suggest **3 random restaurants** based on:

- 📍 **Your Location** (manual entry or geolocation)
- 🍕 **Cuisine Preferences** (17 options: Pizza, Mexican, Sushi, Burgers, Vegan, etc.)
- 🚗 **Search Radius** (Walk 1mi, Drive 5mi, Far 15mi)
- 🎲 **Custom Cravings** ("Tacos with outdoor seating")

### Features

✅ **Beautiful UI** - Smooth animations, "Foxie" the fox mascot, responsive design
✅ **Smart Search** - Powered by Gemini 2.5 Flash with Google Maps grounding
✅ **Favorites** - Save your go-to spots (persisted in browser)
✅ **Reroll** - Don't like the picks? Spin again with different results
✅ **Near Me** - One-click geolocation for convenience
✅ **No Account Needed** - Anonymous, instant, free

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v20+ ([Download](https://nodejs.org/))
- **Google Gemini API Key** ([Get yours free](https://aistudio.google.com/app/apikey))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/pabs-ai/No-You-Pick..git
cd No-You-Pick.

# 2. Install dependencies
npm install

# 3. Create .env.local file
echo "VITE_GEMINI_API_KEY=your_actual_api_key_here" > .env.local
# 4. Start development server
npm run dev
```

**Open http://localhost:3000** and start searching! 🎉

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Required: Google Gemini API Key
# Get yours at: https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=AIza...your_key_here

# Optional: Set to 'production' for production builds
NODE_ENV=development
```

> **Note**: Never commit `.env.local` to git - it's already in `.gitignore`

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19.2 + TypeScript | Modern UI framework with type safety |
| **Build Tool** | Vite 6.2 | Lightning-fast dev server & bundler |
| **AI Engine** | Google Gemini 2.5 Flash | Restaurant recommendations |
| **Maps Data** | Google Maps API | Live POI data, ratings, hours |
| **State Management** | React Hooks + localStorage | Simple, effective state handling |
| **Styling** | Utility CSS (Tailwind-like) | Inline styles for rapid iteration |

---

## 📂 Project Structure

```
No-You-Pick./
├── App.tsx                 # Main application component (546 lines)
├── index.tsx               # React mount point
├── index.html              # HTML entry point
├── components/             # Reusable UI components
│   ├── Button.tsx          # Styled button variants
│   ├── Card.tsx            # Restaurant card display
│   ├── Mascot.tsx          # "Foxie" the fox mascot
│   ├── SlotMachine.tsx     # Spinning animation
│   └── LoadingScreen.tsx   # Loading UI
├── services/               # Business logic
│   └── geminiService.ts    # Gemini AI integration (7KB)
├── types.ts                # TypeScript interfaces
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies & scripts
└── 000-docs/               # Project documentation
    ├── 001-DR-STND-...     # Filing system standard
    ├── 002-AA-AUDT-...     # DevOps playbook (system analysis)
    └── 003-DR-GUID-...     # CLI & Claude Code learning guide
```

---

## 🎮 How to Use

### 1. **Choose Your Craving**
Select from 17 cuisine types (or "Any" for variety):
- 🍕 Pizza • 🌮 Mexican • 🍣 Sushi • 🍔 Burgers • 🥡 Asian
- 🍝 Italian • 🥩 Steak • 🥦 Veggie • 🌱 Vegan • 🥗 Healthy
- ☕ Coffee • 🍩 Dessert • 🍗 Chicken • 🍛 Indian • 🥘 Thai • 🎲 Any

Or type a **custom craving** (e.g., "Korean BBQ with outdoor seating")

### 2. **Set Your Location**
- **Type it in**: "New York", "90210", "123 Main St"
- **Or use "Near Me"**: One-click geolocation

### 3. **Pick Your Radius**
- 🚶 **Walk (1 mile)** - Close by
- 🚗 **Drive (5 miles)** - Quick trip
- 🛣️ **Far (15 miles)** - Explore further

### 4. **Let's Eat!**
- Foxie finds **3 random restaurants** in seconds
- See ratings, addresses, open status, and why it's great
- Click to open in Google Maps
- ❤️ **Save favorites** for later

### 5. **Not Feeling It? Spin Again!**
- Hit "Spin Again" for 3 new picks (excludes previous results)
- Or start a new search with different criteria

---

## 🧪 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create production build in `dist/` |
| `npm run preview` | Preview production build locally |
| `npx tsc --noEmit` | Type-check without building |

### Development Workflow

```bash
# Start dev server with hot reload
npm run dev

# Make changes to files - Vite auto-reloads

# Build for production
npm run build

# Test production build
npm run preview
```

### Code Quality

**TypeScript** - Full type safety with strict mode
**Vite HMR** - Instant feedback on changes
**ESM Modules** - Modern JavaScript standards

---

## 🚢 Deployment

### Option 1: Firebase Hosting (Recommended)

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize project
firebase init hosting

# 4. Build and deploy
npm run build
firebase deploy --only hosting
```

### Option 2: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 3: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

> **Important**: Set `VITE_GEMINI_API_KEY` environment variable in your hosting provider's dashboard

---

## 🤝 Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or improving docs.

### How to Contribute

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/No-You-Pick..git`
3. **Create a branch**: `git checkout -b feature/amazing-feature`
4. **Make changes** and commit: `git commit -m "Add amazing feature"`
5. **Push** to your fork: `git push origin feature/amazing-feature`
6. **Open a Pull Request** on GitHub

### Development Setup for Contributors

```bash
# 1. Fork and clone
gh repo fork pabs-ai/No-You-Pick. --clone

# 2. Install dependencies
npm install

# 3. Create .env.local with your API key
echo "VITE_GEMINI_API_KEY=your_key" > .env.local

# 4. Start developing!
npm run dev
```

### Contribution Ideas

- 🐛 **Bug Fixes**: Found a bug? Fix it and submit a PR
- ✨ **New Features**: Dietary filters, favorites sync, dark mode
- 📱 **Mobile Improvements**: Better touch interactions
- 🧪 **Testing**: Add unit tests, integration tests
- 📚 **Documentation**: Improve READMEs, add guides
- 🎨 **Design**: UI/UX enhancements, animations
- ♿ **Accessibility**: WCAG 2.1 compliance improvements

---

## 📚 Documentation

Comprehensive docs are available in the `000-docs/` directory:

| Document | Description |
|----------|-------------|
| [**Filing System Standard**](000-docs/001-DR-STND-document-filing-system-standard-v3.md) | How we organize documentation |
| [**DevOps Playbook**](000-docs/002-AA-AUDT-appaudit-devops-playbook.md) | Complete system analysis & operational guide |
| [**CLI Learning Guide**](000-docs/003-DR-GUID-getting-started-with-cli-and-claude-code.md) | Learn terminal, Git, and Claude Code |

---

## 🐛 Troubleshooting

### "VITE_GEMINI_API_KEY is undefined"

**Solution**: Create `.env.local` file in project root:
```bash
echo "VITE_GEMINI_API_KEY=your_actual_key" > .env.local
```
Then restart the dev server.

### "Failed to fetch" / API Error

**Causes**:
- Invalid API key → Get a new one at https://aistudio.google.com/app/apikey
- Quota exceeded → Check usage in Google AI Studio
- Network issue → Check internet connection

### "No restaurants found"

**Try**:
- Broaden cuisine (use "Any")
- Increase radius (try 15 miles)
- Different location
- Check if you're in a remote area

### Geolocation Not Working

**Solutions**:
- Allow location permission in browser
- Check browser address bar for location icon
- Try incognito mode to reset permissions
- Use manual location input instead

---

## 🔒 Security

### API Key Safety

⚠️ **Important**: The Gemini API key is currently exposed in the browser (visible in DevTools). For production use:

1. **Move API calls to a backend** (Cloud Functions, Vercel Functions, etc.)
2. **Use environment variables** on the server
3. **Implement rate limiting** to prevent abuse
4. **Monitor API usage** in Google AI Studio

See `000-docs/002-AA-AUDT-appaudit-devops-playbook.md` for detailed security recommendations.

### Reporting Security Issues

If you find a security vulnerability, please **DO NOT** open a public issue. Email [security contact] instead.

---

## 📄 License

[License Type] © 2025 pabs-ai

---

## 🙏 Acknowledgments

- **Google Gemini AI** for powering the recommendations
- **Google Maps** for real-time restaurant data
- **AI Studio** for the awesome platform
- **React Team** for React 19
- **Vite Team** for the amazing build tool

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/pabs-ai/No-You-Pick./issues)
- **Discussions**: [GitHub Discussions](https://github.com/pabs-ai/No-You-Pick./discussions)
- **AI Studio**: https://ai.studio/apps/drive/1U-6Awd8rVfwlawZKjPQZxN1HI54b3Rgg

---

## 🗺️ Roadmap

### ✅ Completed
- [x] Basic restaurant search with Gemini AI
- [x] Google Maps integration
- [x] Favorites system
- [x] Responsive design
- [x] Geolocation support

### 🚧 In Progress
- [ ] Production deployment (Firebase Hosting)
- [ ] Backend API (Cloud Functions)
- [ ] Automated testing

### 🔮 Future
- [ ] User accounts & cloud-synced favorites
- [ ] Dark mode toggle
- [ ] Recent searches history
- [ ] Share results with friends
- [ ] Dietary filters (vegan, gluten-free, etc.)
- [ ] Restaurant ratings & reviews
- [ ] Mobile app (React Native)

---

<div align="center">

**Made with ❤️ and 🤖 AI**

Stop arguing, start eating! 🍽️

[Report Bug](https://github.com/pabs-ai/No-You-Pick./issues) · [Request Feature](https://github.com/pabs-ai/No-You-Pick./issues) · [View Demo](https://ai.studio/apps/drive/1U-6Awd8rVfwlawZKjPQZxN1HI54b3Rgg)

</div>
