# Self-Citation Scholar

A web application for analyzing self-citation patterns in academic research using the Semantic Scholar API.

## Features

- **Self-Citation Analysis**: Analyze self-citation patterns for academic authors
- **Multiple Author Support**: Combine multiple Semantic Scholar author IDs for the same author
- **Accurate H-index Calculation**: H-index is computed from scratch when multiple author IDs are provided, ensuring accurate representation of academic impact
- **Two Detection Methods**: 
  - Method 1: Target author appears in citing paper
  - Method 2: Author overlap between cited and citing papers
- **Comprehensive Metrics**: H-index, citation rates, and detailed paper analysis
- **Data Export**: Download analysis results as JSON
- **Progress Tracking**: Real-time progress updates during analysis
- **Error Handling**: Robust error handling with retry logic for API rate limits

## How to Use

1. **Enter Author ID(s)**: 
   - Enter a single Semantic Scholar author ID (e.g., `2262347`)
   - Or enter multiple author IDs separated by commas (e.g., `2262347, 1234567, 8901234`)
   
2. **Multiple Author IDs**: 
   - Useful when Semantic Scholar has split an author's profile into multiple IDs
   - The system will combine all papers from the specified author IDs
   - Self-citation detection works across all combined profiles

3. **View Results**:
   - Author profile with combined metrics
   - Self-citation analysis with two detection methods
   - Detailed paper list with citation breakdown
   - Download complete analysis data

## Why Multiple Author IDs?

Semantic Scholar sometimes splits a single author's publications across multiple author IDs due to:
- Name variations
- Different institutional affiliations
- Data inconsistencies

This feature allows you to combine these split profiles for a complete analysis of an author's self-citation patterns.

**Important Note**: When multiple author IDs are provided, the H-index is recalculated from scratch based on the combined list of papers. This ensures the H-index accurately reflects the author's academic impact across all their publications, rather than simply taking the maximum of individual H-indices.

## Recent Updates

### H-index Computation Fix
- **Fixed**: H-index calculation when multiple author IDs are provided
- **Before**: Used the maximum of individual H-indices from Semantic Scholar API
- **After**: Computes H-index from scratch based on the combined list of papers
- **Impact**: More accurate representation of academic impact across all publications

### Technical Improvements
- **API Reliability**: Enhanced error handling with exponential backoff for rate limits
- **Progress Tracking**: Real-time progress updates during analysis
- **Performance**: Optimized batch processing with configurable delays
- **Logging**: Comprehensive logging for debugging and monitoring

## Project info

**URL**: https://lovable.dev/projects/d44cfdfe-f0cf-41de-ac58-182821ca8ec2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d44cfdfe-f0cf-41de-ac58-182821ca8ec2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Frontend**: Vite, TypeScript, React
- **UI Components**: shadcn-ui, Tailwind CSS
- **API Integration**: Semantic Scholar API with exponential backoff retry logic
- **Data Processing**: Custom algorithms for self-citation detection and H-index calculation

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d44cfdfe-f0cf-41de-ac58-182821ca8ec2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
