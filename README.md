# Interior Drawing Cost Estimator

AI-powered tool for analyzing 2D interior drawings and generating automatic cost estimates using Claude AI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.2-blue.svg)
![Vite](https://img.shields.io/badge/vite-5.0-purple.svg)

## Features

- 🎨 **AI-Powered Analysis**: Uses Claude Sonnet 4.5 Vision API to analyze interior drawings
- 📊 **Material Extraction**: Automatically identifies materials, fixtures, and finishes
- 💰 **Cost Estimation**: Generates detailed cost breakdowns with real-time pricing
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🔒 **Secure**: API keys stored locally in browser storage
- ⚡ **Fast**: Built with Vite for optimal performance

## Prerequisites

- Node.js 18+ installed
- Anthropic API key ([Get one here](https://console.anthropic.com/))
- Netlify account ([Sign up free](https://app.netlify.com/signup))

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist` folder.

## Deployment to Netlify

### Method 1: Deploy via Netlify CLI (Recommended)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize and Deploy**
   ```bash
   netlify init
   ```
   
   Follow the prompts:
   - Create a new site or link to existing
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Method 2: Deploy via Git

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - Click "Deploy site"

### Method 3: Drag and Drop (Quick Test)

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify UI**
   - Go to [Netlify](https://app.netlify.com)
   - Drag and drop the `dist` folder to the Netlify dashboard

## Configuration

### Setting up API Key

Once deployed, users need to:

1. Click the **Settings** button in the app header
2. Enter their Anthropic API key (starts with `sk-ant-...`)
3. Click **Save API Key**

The API key is stored securely in the browser's localStorage.

### Getting an Anthropic API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (it starts with `sk-ant-`)

## Project Structure

```
interior-estimator-app/
├── src/
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles with Tailwind
├── public/               # Static assets
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── netlify.toml          # Netlify deployment config
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## How It Works

1. **Upload Drawing**: User uploads a 2D interior drawing (PNG, JPG, or PDF)
2. **AI Analysis**: Claude Vision API analyzes the drawing to extract:
   - Materials and finishes
   - Quantities (area, linear meters, units)
   - Specifications and dimensions
   - Room locations
3. **Price Estimation**: System estimates costs based on:
   - Material type and specifications
   - 2025 market prices
   - Quantity calculations
4. **Report Generation**: Displays detailed breakdown with:
   - Per-item costs
   - Subtotal
   - 15% contingency
   - Grand total

## Technology Stack

- **Frontend**: React 18 with Hooks
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: Anthropic Claude Sonnet 4.5
- **Hosting**: Netlify

## API Usage & Costs

### Claude Sonnet 4.5 Pricing
- **Input**: $3.00 per 1M tokens
- **Output**: $15.00 per 1M tokens

### Estimated Costs per Drawing
- Analysis: ~$0.015 per drawing
- Price estimation (10 items): ~$0.005
- **Total**: ~$0.02 per drawing

For 1,000 drawings/month: ~$20/month

## Troubleshooting

### Build Fails on Netlify
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Clear cache and retry: `netlify build --clear-cache`

### API Key Not Working
- Ensure key starts with `sk-ant-`
- Check API key is active in Anthropic Console
- Verify you have sufficient credits

### Drawing Analysis Fails
- Check image format (PNG, JPG supported)
- Ensure file size < 5MB
- Verify drawing has clear annotations

### Prices Seem Inaccurate
- Prices are estimates based on typical market rates
- Adjust contingency percentage as needed
- Consider integrating with specific vendor APIs

## Customization

### Change Contingency Percentage

In `src/App.jsx`, modify line ~205:
```javascript
const contingency = totalCost * 0.15; // Change 0.15 to your desired percentage
```

### Add More Drawing Types

Extend the prompt in `analyzeDrawing()` function to handle:
- Floor plans
- Electrical drawings
- Plumbing layouts
- HVAC schematics

### Integrate Real Price APIs

Replace the AI-based price estimation with actual vendor APIs:
```javascript
// Replace the price estimation fetch call with your API
const priceData = await fetch('YOUR_VENDOR_API_ENDPOINT');
```

## Future Enhancements

- [ ] PDF report generation
- [ ] Excel export functionality
- [ ] MySQL integration for historical pricing
- [ ] Multi-drawing batch processing
- [ ] Vendor database integration
- [ ] Project management features
- [ ] User authentication
- [ ] Cost comparison across vendors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for commercial purposes.

## Support

For issues or questions:
- Open an issue on GitHub
- Check [Anthropic Documentation](https://docs.anthropic.com)
- Review [Netlify Documentation](https://docs.netlify.com)

## Acknowledgments

- Built with [Claude AI](https://anthropic.com) by Anthropic
- UI components inspired by modern design principles
- Icons by [Lucide](https://lucide.dev)

---

**Ready to deploy?** Follow the deployment instructions above and start estimating costs from your interior drawings in minutes! 🚀
