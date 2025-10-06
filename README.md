# APT Detection System

A comprehensive Advanced Persistent Threat (APT) detection system built with Next.js, Supabase, and Raspberry Pi agents.

## Features

- **Real-time Threat Monitoring**: Live dashboard showing detected threats and their severity
- **Raspberry Pi Integration**: Network gateway monitoring using Raspberry Pi devices
- **Threat Management**: Filter, search, and manage security threats
- **System Control**: Add, monitor, and control Raspberry Pi agents
- **Real-time Notifications**: Instant alerts for new threats
- **User Settings**: Customizable notification preferences and threat filters

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: Zustand
- **Monitoring Agents**: Python (Raspberry Pi)

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Raspberry Pi (optional, for network monitoring)

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   \`\`\`

4. Run the database migrations:
   - Execute the SQL scripts in the `scripts` folder in order:
     - `01-create-tables.sql`
     - `02-enable-rls.sql`
     - `03-create-functions.sql`

5. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Raspberry Pi Agent Setup

1. Copy `scripts/raspberry_pi_agent.py` to your Raspberry Pi
2. Install required Python packages:
   \`\`\`bash
   pip install requests psutil
   \`\`\`

3. Update the configuration in the script:
   - Set `API_BASE_URL` to your deployed app URL
   - Set `AGENT_NAME` to identify your Pi

4. Run the agent:
   \`\`\`bash
   python3 raspberry_pi_agent.py
   \`\`\`

## API Endpoints

### Agent Management
- `POST /api/agents/register` - Register a new Raspberry Pi agent
- `POST /api/agents/heartbeat` - Send agent heartbeat with metrics

### Threat Reporting
- `POST /api/threats/report` - Report a detected threat

### System Logs
- `POST /api/logs` - Send system logs
- `GET /api/logs` - Retrieve system logs

## Database Schema

- **raspberry_pi_agents**: Registered monitoring devices
- **threats**: Detected security threats
- **notifications**: User notifications
- **system_logs**: System and agent logs
- **user_settings**: User preferences

## Security Features

- Row Level Security (RLS) enabled on all tables
- Supabase Auth for user authentication
- Secure API endpoints
- Real-time threat notifications
- Automatic threat detection triggers

## Deployment

Deploy to Vercel:

\`\`\`bash
vercel deploy
\`\`\`

Make sure to set up your environment variables in the Vercel dashboard.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License
