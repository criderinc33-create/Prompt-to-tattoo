# Usage Guide - Prompt to Tattoo

## Quick Start

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/criderinc33-create/Prompt-to-tattoo.git
cd Prompt-to-tattoo

# Install all dependencies (root + client)
npm run install-all
```

### 2. Configuration (Optional)
To enable real AI image generation:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and add your Hugging Face API key:
```
HUGGING_FACE_API_KEY=hf_your_api_key_here
```

**How to get a free Hugging Face API key:**
1. Go to [https://huggingface.co/](https://huggingface.co/)
2. Sign up or log in
3. Go to Settings → Access Tokens
4. Create a new token (read permission is sufficient)
5. Copy the token to your `.env` file

### 3. Running the Application

**Development Mode** (recommended for development):
```bash
npm run dev
```
This starts both the backend (port 5000) and frontend (port 3000) concurrently.

**Production Mode**:
```bash
# Build the frontend
npm run build

# Start the server
npm start
```

### 4. Access the Application
- **Development**: Open your browser to [http://localhost:3000](http://localhost:3000)
- **Production**: The server serves the built frontend on [http://localhost:5000](http://localhost:5000)

## Using the Application

### Step-by-Step Guide

1. **Enter Your Prompt**
   - Type a description of the tattoo you want in the text area
   - Be specific for better results (e.g., "dragon with spread wings" instead of just "dragon")

2. **Or Use Example Prompts**
   - Click any of the example chips below the text area
   - Examples include: "Dragon breathing fire", "Minimalist rose with thorns", etc.

3. **Generate the Design**
   - Click the "🎨 Generate Tattoo" button
   - Wait 10-30 seconds for the AI to create your design
   - A loading spinner will appear during generation

4. **View and Download**
   - Once generated, the tattoo design will appear on screen
   - Click "📥 Download Image" to save it to your device
   - Click "✨ Create New Design" to start over

### Demo Mode vs Full Mode

**Demo Mode** (without API key):
- Shows you how the UI works
- Displays a helpful message about configuring the API key
- No actual images are generated

**Full Mode** (with API key):
- Generates real AI tattoo designs
- Images are created using Stable Diffusion 2.1
- Designs are enhanced with tattoo-specific keywords

## Tips for Better Results

### Prompt Writing Tips
1. **Be Specific**: "Geometric wolf head with tribal patterns" > "wolf"
2. **Add Style Keywords**: "minimalist", "traditional", "geometric", "watercolor"
3. **Mention Details**: "with spread wings", "breathing fire", "in a circle"
4. **Think About Composition**: "centered", "symmetrical", "vertical"

### Example Good Prompts
- "Japanese dragon coiled around a sword, traditional style"
- "Minimalist mountain range with geometric sun"
- "Celtic knot in circular mandala pattern"
- "Geometric lion head with sacred geometry"
- "Phoenix bird rising from flames, symmetrical"
- "Traditional sailor anchor with rope and roses"

### Example Results to Expect
The AI generates tattoo-style artwork with:
- Black and white line art aesthetic
- Clean, bold lines suitable for tattoos
- Professional stencil quality
- Artistic detail appropriate for body art

## Troubleshooting

### Issue: "Demo mode" message appears
**Solution**: You need to configure your Hugging Face API key in the `.env` file.

### Issue: "AI model is loading" error
**Solution**: Hugging Face models need to warm up. Wait 20-30 seconds and try again.

### Issue: "Rate limit exceeded"
**Solution**: The application limits requests to 10 per hour per IP. Wait an hour or implement your own rate limiting.

### Issue: "Request timeout"
**Solution**: The AI is taking too long. This happens during high server load. Try again in a few minutes.

### Issue: Frontend won't start
**Solution**: 
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

### Issue: Backend won't start
**Solution**: Check that port 5000 is not in use:
```bash
lsof -i :5000
# Kill any process using port 5000, then restart
```

## API Reference

### POST /api/generate
Generate a tattoo design from text.

**Request:**
```json
{
  "prompt": "dragon with spread wings"
}
```

**Response (Success):**
```json
{
  "success": true,
  "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUh...",
  "prompt": "dragon with spread wings, tattoo design, black and white line art..."
}
```

**Response (Demo Mode):**
```json
{
  "success": true,
  "imageUrl": null,
  "message": "Demo mode: API key not configured...",
  "prompt": "dragon with spread wings, tattoo design..."
}
```

**Rate Limit:** 10 requests/hour per IP

### GET /api/health
Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Prompt-to-Tattoo API is running"
}
```

## Advanced Usage

### Custom Port Configuration
```bash
# Set custom port
PORT=8080 npm start
```

### Running Only Backend
```bash
npm run server
```

### Running Only Frontend
```bash
npm run client
```

### Building for Production
```bash
# Build optimized frontend
npm run build

# Serve production build
NODE_ENV=production npm start
```

## Security Notes

- Never commit your `.env` file with API keys
- The `.gitignore` is configured to exclude `.env` files
- Rate limiting is built-in but basic (in-memory)
- For production, consider implementing:
  - User authentication
  - Database-backed rate limiting
  - API key rotation
  - Request validation

## Next Steps

After getting familiar with the basic usage, you might want to:

1. **Customize the UI**: Edit `client/src/App.css` for styling changes
2. **Add Features**: Modify `client/src/App.js` for new functionality
3. **Change AI Models**: Update the model URL in `server/routes/generate.js`
4. **Deploy**: Use services like Heroku, Vercel, or Railway for hosting

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check the main README.md for more information
- Review the code comments for implementation details

Happy tattoo designing! 🎨✨
