# Dramabox Netflix Clone

This is a Netflix-style streaming application built with React, Vite, Tailwind CSS, and Express.

## Features

- **Homepage**: Trending, Latest, VIP, For You, Dub Indo sections.
- **Search**: Search for dramas.
- **Detail Page**: Movie info and episode list.
- **Watch Page**: Video player with episode selector and auto-next.
- **My List**: Add to favorites (persisted in local storage).
- **Authentication**: Simple local session.
- **Responsive**: Mobile and desktop optimized.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Swiper, Lucide React.
- **Backend**: Express (for API proxying), Axios.
- **State Management**: Zustand (with persistence).
- **Routing**: React Router v7.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file (or update `.env.example`) with:
    ```env
    DRAMABOX_API_KEY=your_api_key_here
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    This starts the Express server with Vite middleware on http://localhost:3000.

4.  **Build for Production**:
    ```bash
    npm run build
    npm start
    ```

## API

The app uses a proxy server at `/api/proxy` to forward requests to the Dramabox API, keeping your API key secure.
