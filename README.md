# L-Line Generator

A web app that creates personalized programming portraits by connecting your face to your GitHub programming languages.

## Features

- Upload a portrait photo
- Enter your GitHub username
- AI detects your face and fetches your language usage
- Downloads a custom portrait with connecting lines to language icons

## Installation

```bash
git clone https://github.com/yourusername/l-line-generator.git
cd l-line-generator
pnpm install
pnpm dev
```

Open `http://localhost:5173`

## How to Use

1. **Upload** a clear portrait photo
2. **Enter** your GitHub username
3. **Generate** your L-Line portrait
4. **Download** the result

## Tech Stack

- React + TypeScript
- TensorFlow.js (face detection)
- GitHub API
- Tailwind CSS
- Devicons

## Requirements

- Portrait photo with one visible face
- Public GitHub profile with repositories
- Modern browser with JavaScript

## Build

```bash
pnpm build
```

## License

MIT
