# Bouncing Ring Simulation

## Overview

The Bouncing Ring Simulation is an interactive web application built with Next.js and React. It simulates a ring bouncing within a circular border, creating a visually engaging and interactive experience.

<img width="1662" alt="Screenshot 2024-10-14 at 23 08 04" src="https://github.com/user-attachments/assets/78499e56-747e-4b8a-9412-5f13a877ad71">


## Features

- Dynamic ring movement with gravity and collision detection
- Colorful background with customizable gradient effects
- Customizable trace color for the bouncing ring
- Adjustable sound effects for collisions
- Multiple physics presets for varied simulation behavior
- Real-time statistics display (speed, bounce count, clear progress, current physics)
- Responsive design for various screen sizes

## Technologies Used

- Next.js
- React
- TypeScript
- HTML5 Canvas
- Web Audio API

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/bouncing-ring-simulation.git
   ```

2. Navigate to the project directory:
   ```
   cd bouncing-ring-simulation
   ```

3. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

4. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

- Click the "Start Simulation" button to begin the animation.
- Use the color picker to change the trace color of the bouncing ring.
- Select different sound types and frequencies for collision effects.
- Choose from various physics presets to change the simulation behavior.
- The simulation will automatically complete when 99% of the area is cleared.
- Click "Reset" to start over at any time.

## Customization

You can adjust various parameters in the `components/bouncing-ring-simulation.tsx` file:

- `BORDER_RADIUS`: Size of the circular border
- `RING_RADIUS`: Size of the bouncing ring
- `INITIAL_SPEED`: Starting speed of the ring
- `physicsPresets`: Define new physics presets or modify existing ones

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
