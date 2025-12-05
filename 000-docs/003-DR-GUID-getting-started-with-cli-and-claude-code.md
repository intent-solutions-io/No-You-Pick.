# Getting Started with CLI & Claude Code - For Pablo 🚀

**Date**: 2025-12-05
**For**: Pablo (learning CLI workflow)
**From**: Jeremy
**Purpose**: Step-by-step guide to level up from web-only to CLI + AI-assisted development

---

## 📚 Table of Contents

1. [Why Learn CLI?](#why-learn-cli)
2. [Your Current Setup (Termius)](#your-current-setup-termius)
3. [Step 1: Terminal Basics](#step-1-terminal-basics)
4. [Step 2: Git CLI Mastery](#step-2-git-cli-mastery)
5. [Step 3: GitHub CLI (gh)](#step-3-github-cli-gh)
6. [Step 4: Claude Code Setup](#step-4-claude-code-setup)
7. [Practice Project: No-You-Pick](#practice-project-no-you-pick)
8. [Common Workflows](#common-workflows)
9. [Troubleshooting](#troubleshooting)
10. [Resources & Next Steps](#resources--next-steps)

---

## Why Learn CLI?

### What You'll Gain 🎯

**Speed**: 10x faster for repetitive tasks
- Web: Click → New File → Type name → Click → Paste code → Click Save (30 seconds)
- CLI: `echo "code" > filename.ts` (2 seconds)

**Power**: Do things the web UI can't
- Batch operations (rename 50 files at once)
- Complex searches (find all TODOs in TypeScript files)
- Automation (deploy with one command)

**AI Assistance**: Claude Code = Your Pair Programmer
- "Add authentication to this app" → Claude writes code, tests, docs
- "Fix this bug" → Claude debugs, patches, commits
- "Deploy to Firebase" → Claude configures everything

### What You'll Keep from Web 🌐

Don't worry - **you'll still use GitHub web for**:
- Reviewing PRs (easier to see diffs visually)
- Managing issues and projects
- Quick README edits
- Collaborating with non-technical folks

**CLI doesn't replace web - it supercharges it.**

---

## Your Current Setup (Termius)

### What is Termius?

Termius is an **SSH client** - it lets you connect to remote servers via terminal. You already have this, which means:

✅ You're comfortable with terminal interfaces
✅ You understand commands and outputs
✅ You just need to learn **local CLI** (on your machine, not remote servers)

### Termius vs Local Terminal

| Feature | Termius (SSH to remote) | Local Terminal (your machine) |
|---------|-------------------------|-------------------------------|
| **Purpose** | Connect to servers | Run commands on your laptop |
| **Where** | Remote Linux/Unix servers | macOS/Linux/Windows (WSL) |
| **Uses** | Server management, deployments | Development, git, npm, testing |
| **Learning Curve** | You already know this! | Similar commands, easier setup |

**Good News**: If you can use Termius, you can use local terminal! Same commands (cd, ls, git, npm, etc.)

---

## Step 1: Terminal Basics

### Opening Your Terminal

**macOS**:
- Press `Cmd + Space` → Type "Terminal" → Enter
- Or: Applications → Utilities → Terminal

**Windows**:
- Install WSL2 (Windows Subsystem for Linux): https://aka.ms/wsl2
- Or: Use Git Bash (comes with Git for Windows)

**Linux**:
- Press `Ctrl + Alt + T`
- Or: Search for "Terminal" in apps

### Essential Commands (5-Minute Bootcamp)

```bash
# 1. WHERE AM I? (Print Working Directory)
pwd
# Output: /Users/pablo/projects

# 2. WHAT'S HERE? (List files)
ls
# Output: Documents  Downloads  Desktop

# 3. LIST WITH DETAILS
ls -la
# Shows hidden files, permissions, sizes

# 4. GO SOMEWHERE (Change Directory)
cd Documents
cd ..              # Go up one level
cd ~               # Go to home directory
cd -               # Go back to previous directory

# 5. CREATE FOLDER
mkdir my-new-folder

# 6. CREATE FILE
touch newfile.txt
echo "Hello" > newfile.txt    # Create with content

# 7. READ FILE
cat newfile.txt    # Print entire file
head -n 10 file.txt   # First 10 lines
tail -n 10 file.txt   # Last 10 lines

# 8. SEARCH IN FILES
grep "TODO" *.ts   # Find "TODO" in all .ts files

# 9. DELETE (CAREFUL!)
rm file.txt        # Delete file
rm -rf folder/     # Delete folder and contents (DANGEROUS!)

# 10. COPY & MOVE
cp file.txt backup.txt    # Copy
mv file.txt newname.txt   # Rename/Move
```

### Practice Exercise 1: Navigate Your Projects

```bash
# 1. Open terminal
# 2. Find your home directory
pwd

# 3. Create a test folder
mkdir cli-practice
cd cli-practice

# 4. Create some files
echo "My first CLI file" > test1.txt
echo "Another file" > test2.txt

# 5. List them
ls -la

# 6. Read one
cat test1.txt

# 7. Search for a word
grep "first" *.txt

# 8. Clean up
cd ..
rm -rf cli-practice
```

**Time**: 5 minutes
**Goal**: Get comfortable moving around and creating files

---

## Step 2: Git CLI Mastery

### Why Git CLI vs GitHub Web?

**Web**: Good for reviewing, merging, discussions
**CLI**: Good for creating, committing, branching, pushing

### Installing Git

**macOS**: Already installed (or `brew install git`)
**Windows**: Download from https://git-scm.com/download/win
**Linux**: `sudo apt install git` or `sudo yum install git`

### Git Configuration (One-Time Setup)

```bash
# Set your name and email (appears in commits)
git config --global user.name "Pablo"
git config --global user.email "your-email@example.com"

# Set default branch name to 'main'
git config --global init.defaultBranch main

# Enable colors for easier reading
git config --global color.ui auto

# Check your settings
git config --list
```

### Essential Git Commands

#### 1. **Clone a Repository**

```bash
# Web: Click "Code" → Copy URL → Click "Download ZIP"
# CLI: One command
git clone https://github.com/pabs-ai/No-You-Pick..git
cd No-You-Pick.

# Or with GitHub CLI (better):
gh repo clone pabs-ai/No-You-Pick.
```

#### 2. **Check Status**

```bash
# See what files changed, what's staged, current branch
git status

# Output shows:
# - Modified files (red = not staged)
# - Staged files (green = ready to commit)
# - Untracked files (new files git doesn't know about)
```

#### 3. **Create a Branch**

```bash
# Web: Click "Branch" dropdown → Type name → Click create
# CLI: One command
git checkout -b feature/add-dark-mode

# This does 2 things:
# 1. Creates the branch
# 2. Switches to it
```

#### 4. **Make Changes & Commit**

```bash
# 1. Make changes to files (in your editor)
# 2. Check what changed
git status
git diff              # See exact changes

# 3. Stage files (prepare for commit)
git add filename.ts   # Add specific file
git add .             # Add all changed files

# 4. Commit with message
git commit -m "Add dark mode toggle button"

# Or multi-line commit:
git commit -m "Add dark mode feature

- Created toggle button component
- Added theme context provider
- Updated all components to support dark theme

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### 5. **Push to GitHub**

```bash
# First time pushing this branch:
git push -u origin feature/add-dark-mode

# After that, just:
git push
```

#### 6. **Pull Latest Changes**

```bash
# Update your local copy with remote changes
git pull

# Or fetch without merging:
git fetch
```

#### 7. **Switch Branches**

```bash
# Switch to main
git checkout main

# Switch to another branch
git checkout feature/add-dark-mode

# See all branches
git branch
```

### Practice Exercise 2: Make Your First CLI Commit

```bash
# 1. Clone the No-You-Pick repo (if not already)
gh repo clone pabs-ai/No-You-Pick.
cd No-You-Pick.

# 2. Create a new branch
git checkout -b practice/pablo-first-cli-commit

# 3. Create a simple file
echo "# Pablo's CLI Practice

This is my first file created via CLI!

**Date**: $(date)
**Learned**: Git basics, terminal navigation

## What I can do now:
- Clone repos
- Create branches
- Commit changes
- Push to GitHub
" > 000-docs/004-MS-MISC-pablo-cli-practice.md

# 4. Check status
git status
# Should show the new file as untracked

# 5. Add it
git add 000-docs/004-MS-MISC-pablo-cli-practice.md

# 6. Commit it
git commit -m "docs: Pablo's first CLI commit

Practicing terminal workflow and git commands.

🤖 Learning with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# 7. Push it
git push -u origin practice/pablo-first-cli-commit

# 8. Create PR (we'll learn this next!)
```

**Time**: 10 minutes
**Goal**: Successfully commit and push via CLI

---

## Step 3: GitHub CLI (gh)

### What is GitHub CLI?

`gh` is GitHub's official command-line tool. It lets you do **everything** from terminal:
- Create PRs
- Review code
- Manage issues
- View repos
- Much more

### Installing GitHub CLI

**macOS**:
```bash
brew install gh
```

**Windows**:
```bash
winget install --id GitHub.cli
```

**Linux**:
```bash
# Debian/Ubuntu
sudo apt install gh

# Fedora/RHEL
sudo dnf install gh
```

### Authentication (One-Time Setup)

```bash
# Login to GitHub
gh auth login

# Follow prompts:
# 1. Choose "GitHub.com"
# 2. Choose "HTTPS" (easier)
# 3. Authenticate via browser
# 4. Done!

# Verify it worked
gh auth status
```

### Essential GitHub CLI Commands

#### 1. **View Your Repos**

```bash
# List your repositories
gh repo list

# List another user's repos
gh repo list pabs-ai
```

#### 2. **Clone a Repo**

```bash
# Easier than git clone (handles auth automatically)
gh repo clone pabs-ai/No-You-Pick.
```

#### 3. **Create a Pull Request**

```bash
# After you've pushed a branch:
gh pr create

# Or specify title and body:
gh pr create --title "Add dark mode" --body "Implements dark mode toggle with theme context"

# Or interactive mode (asks you questions):
gh pr create --web
```

#### 4. **View Pull Requests**

```bash
# List open PRs
gh pr list

# View a specific PR
gh pr view 1

# View PR in browser
gh pr view 1 --web
```

#### 5. **Review and Merge PRs**

```bash
# Check out a PR locally to test it
gh pr checkout 1

# Approve a PR
gh pr review 1 --approve

# Merge a PR
gh pr merge 1 --squash --delete-branch
```

#### 6. **Manage Issues**

```bash
# List issues
gh issue list

# Create an issue
gh issue create --title "Bug: Search not working" --body "Describe the bug..."

# View issue
gh issue view 5
```

### Practice Exercise 3: Create a PR via CLI

```bash
# Continuing from Exercise 2...

# 1. Make sure your branch is pushed
git push -u origin practice/pablo-first-cli-commit

# 2. Create PR
gh pr create --title "📚 Pablo's First CLI Commit" --body "Practicing CLI workflow!

## What I Learned
- Terminal navigation
- Git basics (clone, commit, push)
- GitHub CLI (gh commands)

## Files Added
- 004-MS-MISC-pablo-cli-practice.md

This is me learning by doing! 🚀"

# 3. View the PR in your browser
gh pr view --web

# 4. (Optional) Merge it yourself!
gh pr merge --squash --delete-branch
```

**Time**: 5 minutes
**Goal**: Create and manage a PR without touching the web UI

---

## Step 4: Claude Code Setup

### What is Claude Code?

**Claude Code** is an AI assistant that lives in your terminal. It can:
- Write entire features from descriptions
- Debug complex issues
- Refactor code
- Generate documentation
- Set up infrastructure
- And much more

**Think of it as**: A senior developer pair programming with you 24/7

### Installing Claude Code

Visit: https://claude.com/code

Follow the installation instructions for your OS.

### First Conversation with Claude

```bash
# 1. Open Claude Code in your project
cd No-You-Pick.
claude

# 2. Try these prompts:

"Show me the project structure"

"What does this app do?"

"Find all TODOs in the codebase"

"Add a simple test for the geminiService"

"Create a .env.local.example file with GEMINI_API_KEY"

"Help me deploy this to Firebase Hosting"
```

### How to Work with Claude

**Good Prompts** ✅:
```
"Add authentication using Firebase Auth. Include:
- Login/signup forms
- Protected routes
- User context provider
- Logout functionality"

"The search is slow. Profile it and optimize."

"Create a comprehensive test suite for the restaurant search feature"

"Set up CI/CD with GitHub Actions to deploy to Firebase on merge to main"
```

**Vague Prompts** ❌:
```
"Make it better"
"Fix the bug"
"Add some tests"
```

**Rule of Thumb**: Be specific about **what** you want and **why**. Claude will figure out the **how**.

### Practice Exercise 4: Your First Claude Code Session

```bash
# 1. Open Claude in your project
cd /path/to/No-You-Pick.
claude

# 2. Ask Claude to create a simple improvement:
"Create a .env.local.example file that shows which environment variables are needed. Include helpful comments."

# 3. Review what Claude created
cat .env.local.example

# 4. Commit it
git add .env.local.example
git commit -m "docs: Add .env.local.example template

Makes it easier for new contributors to set up their environment.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# 5. Push it
git push
```

**Time**: 10 minutes
**Goal**: Successfully use Claude to generate a file

---

## Practice Project: No-You-Pick

### Learning Path (Start Here!)

Follow these exercises in order to build real skills:

#### Week 1: Terminal & Git Basics

**Day 1-2**: Terminal navigation
- [ ] Complete Exercise 1 (navigate, create files)
- [ ] Explore your projects folder via CLI
- [ ] Practice for 30 minutes daily

**Day 3-4**: Git fundamentals
- [ ] Complete Exercise 2 (first commit)
- [ ] Make 5 more commits (edit README, add comments, etc.)
- [ ] Practice branching

**Day 5-7**: GitHub CLI
- [ ] Complete Exercise 3 (create PR via CLI)
- [ ] Review someone else's PR via CLI
- [ ] Merge a PR via CLI

#### Week 2: Claude Code

**Day 1-3**: Simple tasks with Claude
- [ ] Complete Exercise 4 (.env.local.example)
- [ ] Ask Claude to add code comments
- [ ] Ask Claude to create a simple component

**Day 4-7**: Complex tasks with Claude
- [ ] Ask Claude to add a new feature (e.g., "recent searches")
- [ ] Ask Claude to set up testing
- [ ] Ask Claude to create deployment scripts

#### Week 3: Real Contributions

**Day 1-7**: Build something real
- [ ] Pick a feature from the AppAudit playbook
- [ ] Use Claude to implement it
- [ ] Create PR via CLI
- [ ] Deploy to staging (with Claude's help)

---

## Common Workflows

### Workflow 1: Fix a Bug

```bash
# 1. Create bug fix branch
git checkout -b fix/search-not-working

# 2. Ask Claude to help debug
claude
# Prompt: "The restaurant search isn't working. Help me debug it."

# 3. Test the fix
npm run dev
# Test manually

# 4. Commit
git add .
git commit -m "fix: Restaurant search API key validation

- Added proper error handling for missing API key
- Show helpful message to user
- Updated environment validation

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# 5. Push and create PR
git push -u origin fix/search-not-working
gh pr create --title "Fix: Restaurant search validation" --body "Fixes #123"

# 6. Merge when approved
gh pr merge --squash --delete-branch
```

### Workflow 2: Add a New Feature

```bash
# 1. Create feature branch
git checkout -b feature/save-preferences

# 2. Ask Claude to implement
claude
# Prompt: "Add a preferences feature that saves:
# - Default cuisine preference
# - Default radius
# - Favorite location
# Store in localStorage and load on app start"

# 3. Review what Claude created
git status
git diff

# 4. Test it
npm run dev

# 5. If good, commit
git add .
git commit -m "feat: Add user preferences

- Save default cuisine, radius, location
- Persist to localStorage
- Load on app initialization
- Add preferences UI in settings

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# 6. Push and PR
git push -u origin feature/save-preferences
gh pr create

# 7. Merge when approved
gh pr merge --squash --delete-branch
```

### Workflow 3: Deploy to Production

```bash
# 1. Make sure you're on main and updated
git checkout main
git pull

# 2. Ask Claude to help deploy
claude
# Prompt: "Help me deploy this app to Firebase Hosting. Set up:
# - Firebase project configuration
# - Deployment scripts
# - Environment variables for production
# - GitHub Actions for auto-deploy"

# 3. Follow Claude's instructions
# Claude will create firebase.json, .github/workflows/deploy.yml, etc.

# 4. Test deployment
npm run build
firebase deploy --only hosting --project staging

# 5. If works, commit deployment config
git add .
git commit -m "ci: Add Firebase deployment automation

- Configure Firebase Hosting
- Add GitHub Actions workflow
- Set up production environment

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# 6. Push to enable auto-deploy
git push
```

---

## Troubleshooting

### "Command not found: git"

**Solution**: Git not installed
```bash
# macOS
brew install git

# Windows
# Download from https://git-scm.com/download/win

# Linux
sudo apt install git
```

### "Permission denied (publickey)"

**Solution**: SSH key not set up
```bash
# Use HTTPS instead (easier)
gh auth login
# Choose HTTPS when prompted

# Or set up SSH:
ssh-keygen -t ed25519 -C "your-email@example.com"
cat ~/.ssh/id_ed25519.pub
# Copy and add to GitHub: Settings → SSH Keys
```

### "You have divergent branches"

**Solution**: Local and remote have different commits
```bash
# Option 1: Pull and merge
git pull

# Option 2: Rebase (cleaner history)
git pull --rebase

# Option 3: Force push (CAREFUL - only if you're sure)
git push --force-with-lease
```

### "npm: command not found"

**Solution**: Node.js not installed
```bash
# macOS
brew install node

# Windows
# Download from https://nodejs.org/

# Linux
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Claude Code not responding

**Solution**: Check connection
```bash
# 1. Restart Claude Code
# 2. Check internet connection
# 3. Update Claude Code to latest version
```

---

## Resources & Next Steps

### Learning Resources

**Terminal Basics**:
- https://www.codecademy.com/learn/learn-the-command-line
- https://linuxjourney.com/ (free, excellent)

**Git & GitHub**:
- https://learngitbranching.js.org/ (interactive, fun)
- https://docs.github.com/en/get-started/quickstart/git-and-github-learning-resources

**Claude Code**:
- https://claude.com/code/docs
- Join the Claude Code community

### Practice Challenges

After completing the exercises, try these:

1. **Week 1 Challenge**: Manage an entire feature (create branch, code, commit, PR, merge) without touching GitHub web

2. **Week 2 Challenge**: Use Claude Code to add a complete testing suite to No-You-Pick

3. **Week 3 Challenge**: Set up full production deployment with Claude's help (Firebase + CI/CD)

4. **Month 1 Challenge**: Build a small side project entirely via CLI + Claude Code

### Next Skills to Learn

Once comfortable with basics:

1. **Advanced Git**: Rebasing, cherry-picking, stashing
2. **Docker**: Containerize your apps
3. **Terraform**: Infrastructure as code
4. **CI/CD**: GitHub Actions, automated testing
5. **Shell Scripting**: Automate repetitive tasks

---

## You Got This! 💪

**Remember**:
- Everyone starts as a beginner
- CLI seems scary at first, but becomes second nature
- Practice daily (even 15 minutes helps)
- Don't be afraid to make mistakes (that's what branches are for!)
- Ask Claude for help anytime

**Pro Tip**: Keep this guide open in a browser tab while practicing. Reference it whenever you forget a command.

**First Goal**: Complete all 4 practice exercises this week. You'll be amazed at how much you learn!

---

**Questions?** Drop them in GitHub Discussions or ping me in a PR comment.

Happy coding! 🚀

---

**Document**: 003-DR-GUID-getting-started-with-cli-and-claude-code.md
**Author**: Jeremy
**For**: Pablo
**Last Updated**: 2025-12-05
