# 🚀 Local Setup Guide - Azure AI Avatar Conversational Bot

This guide will help you set up the Azure AI Avatar Conversational Bot on your local machine.

## **1. Prerequisites**
Make sure you have these installed:
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Azure OpenAI Service** account
- **Azure Speech Services** account

## **2. Clone and Install**

\`\`\`bash
# Clone the repository (or download the code)
git clone <your-repository-url>
cd avatar-conversational-bot

# Install dependencies
npm install
\`\`\`

## **3. Azure Services Setup**

### **Azure OpenAI Setup:**
1. Go to [Azure Portal](https://portal.azure.com/)
2. Create an **Azure OpenAI** resource
3. Deploy a **GPT-4o** model
4. Note down:
   - **Endpoint URL**
   - **API Key**
   - **Deployment Name**

### **Azure Speech Services Setup:**
1. In Azure Portal, create a **Speech Services** resource
2. Note down:
   - **Endpoint URL**
   - **Subscription Key**
   - **Region**

## **4. Environment Configuration**

Create a `.env.local` file in your project root:

\`\`\`env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/openai/deployments/your-deployment-name/chat/completions?api-version=2025-01-01-preview
AZURE_OPENAI_API_KEY=your-azure-openai-api-key-here
DEPLOYMENT_NAME=your-deployment-name

# Azure Speech Services Configuration
AZURE_SPEECH_ENDPOINT=https://your-region.api.cognitive.microsoft.com/
SPEECH_KEY=your-speech-services-key-here

# Optional - Database (if you want to add persistence later)
DATABASE_URL=postgresql://username:password@localhost:5432/avatar_bot

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

## **5. Replace Placeholder Values**

Update your `.env.local` with actual values:

\`\`\`env
# Example with real values (replace with yours):
AZURE_OPENAI_ENDPOINT=https://myopenai.openai.azure.com/openai/deployments/gpt-4o-deployment/chat/completions?api-version=2025-01-01-preview
AZURE_OPENAI_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
DEPLOYMENT_NAME=gpt-4o-deployment
AZURE_SPEECH_ENDPOINT=https://eastus.api.cognitive.microsoft.com/
SPEECH_KEY=xyz789abc123def456ghi789jkl012mno345pqr678
\`\`\`

## **6. Start Development Server**

\`\`\`bash
# Start the development server
npm run dev
\`\`\`

The app will be available at: **http://localhost:3000**

## **7. Test the Setup**

1. **Open your browser** to `http://localhost:3000`
2. **Click "Test Azure OpenAI"** - should show success
3. **Click "Test Speech"** - should show connection status
4. **Click "System Info"** - check compatibility
5. **Try "Test Chat"** - should get AI response

## **8. Troubleshooting Common Issues**

### **HTTPS Required Error (Mobile)**
- Use `https://localhost:3000` or deploy to get HTTPS
- Or test on desktop first

### **Microphone Permission Denied**
- Allow microphone access in browser
- Check browser settings
- Try different browser (Chrome works best)

### **Azure Connection Failed**
- Verify your API keys are correct
- Check endpoint URLs
- Ensure your Azure resources are active

### **Build Errors**
\`\`\`bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Or try with yarn
npm install -g yarn
yarn install
\`\`\`

## **9. Project Structure**

\`\`\`
avatar-conversational-bot/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Main AI chat endpoint
│   │   ├── speech/route.ts        # Speech recognition
│   │   └── test-*/route.ts        # Testing endpoints
│   ├── page.tsx                   # Main page
│   └── layout.tsx                 # App layout
├── components/
│   ├── avatar-bot-main.tsx        # Main app component
│   ├── human-avatar.tsx           # 3D avatar (optional)
│   └── voice-selector.tsx         # Voice selection
├── hooks/
│   └── use-conversation.tsx       # Main conversation logic
├── .env.local                     # Your environment variables
├── package.json                   # Dependencies
└── README.md                      # Documentation
\`\`\`

## **10. Development Commands**

\`\`\`bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run tests (if added)
npm test
\`\`\`

## **11. Browser Compatibility**

### **Best Support:**
- Chrome (desktop & mobile)
- Safari (desktop & mobile)
- Edge (desktop)

### **Limited Support:**
- Firefox (desktop only)
- Other mobile browsers

## **12. Next Steps**

Once running locally:
1. **Test all features** thoroughly
2. **Customize the avatar** appearance
3. **Add more voice options**
4. **Deploy to production** (Vercel recommended)
5. **Add database** for conversation history

## **13. Quick Start Checklist**

- [ ] Node.js 18+ installed
- [ ] Project cloned/downloaded
- [ ] `npm install` completed
- [ ] Azure OpenAI resource created
- [ ] Azure Speech Services created
- [ ] `.env.local` file created with real values
- [ ] `npm run dev` running successfully
- [ ] Browser opened to `http://localhost:3000`
- [ ] Test buttons working
- [ ] Microphone permission granted

## **14. Environment Variables Reference**

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_OPENAI_ENDPOINT` | Full Azure OpenAI endpoint URL | `https://myopenai.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview` |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | `abc123def456...` |
| `DEPLOYMENT_NAME` | Your GPT-4o deployment name | `gpt-4o-deployment` |
| `AZURE_SPEECH_ENDPOINT` | Azure Speech Services endpoint | `https://eastus.api.cognitive.microsoft.com/` |
| `SPEECH_KEY` | Azure Speech Services key | `xyz789abc123...` |

## **15. Common Setup Errors**

### **Error: "Module not found"**
\`\`\`bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
\`\`\`

### **Error: "Azure OpenAI connection failed"**
- Check your endpoint URL format
- Verify API key is correct
- Ensure deployment name matches Azure

### **Error: "Speech recognition not supported"**
- Use Chrome or Safari browser
- Ensure HTTPS for mobile
- Check microphone permissions

### **Error: "Port 3000 already in use"**
\`\`\`bash
# Solution: Use different port
npm run dev -- -p 3001
\`\`\`

## **16. Getting Azure Credentials**

### **For Azure OpenAI:**
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to your OpenAI resource
3. Go to "Keys and Endpoint"
4. Copy the endpoint and key
5. Go to "Model deployments" for deployment name

### **For Azure Speech Services:**
1. Go to your Speech Services resource
2. Go to "Keys and Endpoint"
3. Copy the key and endpoint
4. Note the region from the endpoint URL

## **17. Support**

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Test Azure services independently
4. Check firewall/network restrictions
5. Try different browsers

---

**That's it! Your Azure AI Avatar Bot should now be running locally at http://localhost:3000**

Happy coding! 🚀
