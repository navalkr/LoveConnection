# GitHub Setup Instructions

Follow these steps to push your Heartlink Dating App project to GitHub:

## 1. Download Your Project Files

First, download all the project files from Replit:
- Click on the three dots in the Files pane
- Select "Download as zip"
- Extract the ZIP file to a local folder on your computer

## 2. Create a New GitHub Repository

- Go to GitHub.com and sign in
- Click the "+" icon in the top-right corner
- Select "New repository"
- Name your repository (e.g., "heartlink-dating-app")
- Add a description (optional)
- Choose whether it should be public or private
- Do not initialize with a README, .gitignore, or license (we'll push our existing files)
- Click "Create repository"

## 3. Initialize Git and Push to GitHub

Open a terminal/command prompt and navigate to your project folder. Run the following commands:

```bash
# Initialize Git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/heartlink-dating-app.git

# Push to GitHub
git push -u origin main
```

Note: If your default branch is named 'master' instead of 'main', use:

```bash
git push -u origin master
```

## 4. Verify Your Repository

- Go to your GitHub repository page
- You should see all your project files uploaded
- The README.md will be displayed on the main page

## 5. Consider Security

- The `.env` file is in `.gitignore` so your API keys won't be uploaded
- Make sure any sensitive information is not included in the uploaded files
- If you accidentally uploaded API keys, reset them immediately

## 6. GitHub Pages Setup (Optional)

If you want to showcase the front-end part of your application:

1. Go to your repository's "Settings" tab
2. Scroll down to "GitHub Pages" section
3. Choose "main" branch and "/docs" folder (you may need to move your build files there)
4. Click "Save"

Your site will be available at: https://YOUR_USERNAME.github.io/heartlink-dating-app/