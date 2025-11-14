# Prompt to Tattoo 🎨✨

An AI-powered web application that transforms text prompts into unique tattoo designs. Generate beautiful, custom tattoo artwork instantly using state-of-the-art AI image generation technology.

![Prompt to Tattoo](https://img.shields.io/badge/AI-Powered-blue) ![React](https://img.shields.io/badge/React-19.x-61dafb) ![Node.js](https://img.shields.io/badge/Node.js-Express-green)

## Features

- 🎨 **AI-Powered Generation**: Generate unique tattoo designs from text descriptions
- 💡 **Easy to Use**: Simple, beautiful interface with example prompts
- 📥 **Download Designs**: Save generated images directly to your device
- 🚀 **Fast & Responsive**: Optimized for speed and user experience
- 🎯 **Tattoo-Optimized**: Enhanced prompts specifically for tattoo-style artwork
- 🔒 **Rate Limited**: Built-in protection against API abuse
- 📱 **Mobile Friendly**: Fully responsive design works on all devices

## Demo

The application works in two modes:
- **Demo Mode**: Works without an API key, shows how the UI functions
- **Full Mode**: With a Hugging Face API key, generates real AI tattoo designs

## Technology Stack

### Frontend
- React 19.x
- Modern CSS with animations
- Responsive design
- Fetch API for backend communication

### Backend
- Node.js with Express 5.x
- Hugging Face API integration (Stable Diffusion 2.1)
- Rate limiting for API protection
- CORS enabled for development

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/criderinc33-create/Prompt-to-tattoo.git
cd Prompt-to-tattoo
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Configure environment variables** (Optional for full AI functionality)
```bash
cp .env.example .env
```

Edit `.env` and add your Hugging Face API key:
```
HUGGING_FACE_API_KEY=your_api_key_here
```

To get a free API key:
1. Visit [Hugging Face](https://huggingface.co)
2. Create an account or sign in
3. Go to Settings → Access Tokens
4. Create a new token with read permissions

4. **Run the application**

For development (runs both frontend and backend):
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

1. **Enter a Prompt**: Describe the tattoo you want (e.g., "dragon with spread wings", "minimalist rose")
2. **Generate**: Click the "Generate Tattoo" button
3. **View Result**: Wait for the AI to create your design (10-30 seconds)
4. **Download**: Save the image to your device
5. **Create More**: Try different prompts to explore various designs

### Example Prompts
- "Dragon breathing fire"
- "Minimalist rose with thorns"
- "Geometric wolf"
- "Japanese wave"
- "Celtic knot"
- "Phoenix rising from ashes"

### Tips for Better Results
- Be specific with your descriptions
- Include style keywords (e.g., "minimalist", "geometric", "traditional")
- Mention details you want (e.g., "with spread wings", "on a mountain")
- Experiment with different phrasings

## API Endpoints

### `POST /api/generate`
Generate a tattoo design from a text prompt.

**Request Body:**
```json
{
  "prompt": "dragon with spread wings"
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "data:image/png;base64,...",
  "prompt": "dragon with spread wings, tattoo design, black and white line art..."
}
```

**Rate Limit:** 10 requests per hour per IP address

### `GET /api/health`
Check API health status.

**Response:**
```json
{
  "status": "ok",
  "message": "Prompt-to-Tattoo API is running"
}
```

## Project Structure

```
Prompt-to-tattoo/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styling
│   │   └── index.js       # React entry point
│   └── package.json       # Frontend dependencies
├── server/                # Node.js backend
│   ├── routes/
│   │   └── generate.js    # Image generation route
│   └── index.js           # Express server
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── package.json           # Root package.json
└── README.md              # This file
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment mode | No | development |
| `HUGGING_FACE_API_KEY` | Hugging Face API token | No (demo mode) | - |

### Rate Limiting

The API implements rate limiting to prevent abuse:
- **Limit**: 10 requests per hour per IP address
- **Window**: 1 hour (3600 seconds)
- **Response**: 429 Too Many Requests when exceeded

## Development

### Running Tests
```bash
# Frontend tests
cd client && npm test

# Backend tests (if added)
npm test
```

### Building for Production
```bash
npm run build
```

This creates an optimized production build in `client/build/`.

## Troubleshooting

### Common Issues

**Issue**: "API model is loading"
- **Solution**: The Hugging Face model needs to warm up. Wait 20-30 seconds and try again.

**Issue**: "Rate limit exceeded"
- **Solution**: Wait for the rate limit window to reset (1 hour) or implement API key-based authentication.

**Issue**: "Request timeout"
- **Solution**: The AI model is taking too long. This usually happens during high traffic. Try again in a few minutes.

**Issue**: Images not generating
- **Solution**: Check that your `HUGGING_FACE_API_KEY` is set correctly in `.env` file.

## Security & Privacy

- ✅ No user data is stored
- ✅ All processing happens in real-time
- ✅ Rate limiting prevents abuse
- ✅ No authentication required (stateless)
- ✅ CORS configured for security
- ⚠️ Generated images are not saved server-side
- ⚠️ API key should be kept secret (use environment variables)

## Disclaimer

**Important**: The tattoo designs generated by this application are AI-created and should be considered as inspiration only. Always consult with a professional tattoo artist before getting any tattoo. The quality, safety, and execution of actual tattoos depend on the skill of the tattoo artist.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

- [Hugging Face](https://huggingface.co) for providing free AI model inference
- [Stability AI](https://stability.ai) for Stable Diffusion models
- React and Express communities for excellent documentation

## Support

If you encounter any issues or have questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Open an issue on GitHub
3. Review existing issues for solutions

---

Made with ❤️ by the Prompt to Tattoo team

