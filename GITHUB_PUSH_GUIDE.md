# Guide to Push Heartlink to GitHub

This guide provides step-by-step instructions to push your Heartlink project to GitHub.

## Prerequisites

1. GitHub account
2. Git installed on your local machine (if you're downloading from Replit)
3. Personal Access Token from GitHub (for authentication)

## Steps for Pushing from Replit

### 1. Initialize Git Repository in Replit

Open the Shell tab in Replit and run:

```bash
# Initialize a new repository
git init

# Configure your GitHub identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2. Add GitHub Repository as Remote

```bash
# Add your repository as remote
git remote add origin https://github.com/navalkr/LoveConnection.git

# Verify the remote was added successfully
git remote -v
```

### 3. Stage, Commit, and Push

```bash
# Stage all files
git add .

# Commit your files
git commit -m "Initial commit - Heartlink Dating App"

# Push to GitHub
git push -f origin main
```

Note: If your default branch is "master" rather than "main", use:
```bash
git push -f origin master
```

Or to push to main branch specifically:
```bash
git push -f origin master:main
```

### 4. Authentication with GitHub

When prompted for username and password:
- Enter your GitHub username
- For password, use your Personal Access Token

## Creating a Personal Access Token on GitHub

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "Heartlink Access"
4. Select the "repo" scope (full control of repositories)
5. Click "Generate token"
6. Copy and save your token immediately - GitHub will only show it once!

## Troubleshooting

### If files don't appear on GitHub:

1. Check if files were staged correctly:
```bash
git status
```

2. Check if files were committed:
```bash
git log
```

3. Try different branch name:
```bash
# Check current branch
git branch

# Push to master instead of main
git push -f origin master
```

4. Verify repository ownership:
Make sure you have write access to the repository navalkr/LoveConnection

### If you get "remote already exists" error:

```bash
git remote remove origin
git remote add origin https://github.com/navalkr/LoveConnection.git
```

## Downloading from Replit First (Alternative Method)

If you prefer to work locally:

1. Download your project from Replit
2. Extract the files to a local folder
3. Navigate to that folder in your terminal/command prompt
4. Follow steps 1-3 above from that folder