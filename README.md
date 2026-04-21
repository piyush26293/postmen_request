# Request Runner

A modern HTTP client built with Electron, React, and TypeScript. Request Runner provides a clean, intuitive interface for testing APIs, managing request collections, and handling different environments.

## Features

### 🚀 Core Functionality
- **HTTP Methods**: Support for GET, POST, PUT, PATCH, DELETE requests
- **Request Builder**: Intuitive interface for URL, headers, query parameters, and request body
- **Response Viewer**: Formatted JSON display, response headers, and error handling
- **Environment Management**: Multiple environments with variable substitution ({{variable}})
- **Collections**: Organize requests into logical groups
- **Request History**: Track and replay previous requests

### 🎨 User Experience
- **Dark/Light Theme**: Toggle between dark and light modes
- **Favorites**: Star important requests for quick access
- **Search & Filter**: Find requests quickly with powerful search
- **Keyboard Shortcuts**: Ctrl+Enter to send requests
- **Auto-save**: All changes are automatically saved

### 🔧 Advanced Features
- **Header Templates**: Save and reuse common header sets
- **Authentication**: Bearer token and API key auth helpers  
- **Body Types**: JSON, form-urlencoded, and raw text support
- **JSON Formatting**: Pretty-print and minify JSON automatically
- **Variable Highlighting**: Visual indicators for environment variables
- **Request Validation**: Built-in validation for URLs, JSON, and headers

### 💾 Data Management
- **Local Storage**: All data stored locally with electron-store
- **Import/Export**: Backup and restore your data as JSON
- **Token Obfuscation**: Basic obfuscation for stored API keys and tokens
- **No Cloud Sync**: Your data stays on your machine

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Desktop**: Electron 28+ with security best practices
- **Build**: Vite for fast bundling and hot reload
- **HTTP**: Axios for request execution (in main process)
- **Storage**: electron-store for persistent local data
- **Package**: electron-builder for distribution

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd request-runner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development**
   ```bash
   npm run dev
   ```
   This starts both the Vite dev server and Electron app.

### Building for Production

```bash
# Build renderer (React app)
npm run build:renderer

# Build main process (Electron)
npm run build:electron

# Package the app
npm run pack

# Create distributable
npm run dist
```

## Project Structure

```
request-runner/
├── electron/
│   ├── main.ts          # Electron main process
│   └── preload.ts       # Preload script for IPC
├── src/
│   ├── components/      # React components
│   │   ├── Common/      # Reusable UI components  
│   │   ├── Sidebar/     # Request list and collections
│   │   ├── RequestEditor/ # Request configuration
│   │   ├── ResponseViewer/ # Response display
│   │   ├── HistoryPanel/   # Request history
│   │   └── Environments/   # Environment management
│   ├── hooks/           # React hooks for data management
│   ├── pages/           # Main application views
│   ├── services/        # Business logic
│   ├── storage/         # Data persistence layer
│   ├── types/           # TypeScript definitions
│   ├── utils/           # Helper functions
│   └── contexts/        # React contexts
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
└── tsconfig*.json       # TypeScript configurations
```

## Usage Guide

### Creating Your First Request

1. **Start the app** - The sidebar shows sample data on first launch
2. **Create new request** - Click the "+" button in the sidebar
3. **Configure request**:
   - Enter a descriptive name
   - Select HTTP method (GET, POST, etc.)  
   - Enter the URL
   - Add headers, query parameters, or body as needed
4. **Send request** - Click "Send" or press Ctrl+Enter
5. **View response** - Results appear in the response panel

### Working with Collections

- **Create collection**: Click folder icon in sidebar
- **Add requests**: Drag requests into collections or use context menu
- **Organize**: Use collections to group related API endpoints

### Environment Variables

1. **Create environment**: Click environment dropdown → Create new
2. **Add variables**: Define key-value pairs like `baseUrl = https://api.example.com`
3. **Use in requests**: Reference with `{{baseUrl}}/users` in URLs or headers
4. **Switch environments**: Use dropdown to change active environment

### Headers and Authentication

- **Common headers**: Use autocomplete for standard headers
- **Templates**: Save frequently used header sets
- **Bearer tokens**: Use Auth tab for OAuth 2.0 tokens
- **API keys**: Configure API key authentication easily

## Security Notes

⚠️ **Important Security Information**

- **Local storage only**: No data is sent to external servers
- **Token obfuscation**: Stored tokens are base64 encoded (not encrypted)
- **No PIN protection yet**: PIN lock feature is planned for future release
- **CORS handled**: HTTP requests run in main process to avoid CORS issues

For production use with sensitive data:
- Export/backup your data regularly
- Consider additional encryption for sensitive tokens
- Use environment variables for truly sensitive data

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Send current request |
| `Ctrl+N` | Create new request |
| `Ctrl+D` | Duplicate current request |
| `Ctrl+F` | Focus search |
| `Ctrl+,` | Open settings |

## Development

### Available Scripts

```bash
npm run dev          # Start development mode
npm run build        # Build for production  
npm run build:renderer # Build React app only
npm run build:electron # Build Electron main only
npm run pack         # Package app (no installer)
npm run dist         # Create distributable
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Architecture Decisions

- **IPC Security**: All HTTP requests execute in main process for security
- **State Management**: React hooks + local storage, no external state library
- **Styling**: Tailwind CSS for rapid UI development  
- **Type Safety**: Full TypeScript coverage with strict mode
- **Performance**: Vite for fast builds and HMR

### Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes with tests
4. Run linting: `npm run lint`
5. Build successfully: `npm run build`
6. Submit pull request

## Troubleshooting

### Common Issues

**Electron won't start in development**
- Ensure port 5173 is available
- Try `npm run dev:vite` first, then `npm run dev:electron`

**Build fails**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

**Requests fail with CORS**
- This shouldn't happen as requests run in main process
- Check network connectivity and URL format

**Data not persisting** 
- Check file permissions in app data directory
- Try restarting the app

### Getting Help

- Check existing issues in the repository
- Create new issue with reproduction steps
- Include OS, Node version, and error messages

## License

MIT License - see LICENSE file for details.

## Roadmap

### Planned Features
- [ ] PIN lock for data protection
- [ ] Request scripting with JavaScript
- [ ] Mock server functionality
- [ ] WebSocket support
- [ ] GraphQL query builder
- [ ] Team collaboration features
- [ ] Plugin system
- [ ] Advanced response testing

Built with ❤️ using Electron, React, and TypeScript.