# AIS Stream Backend Service

Server-side WebSocket client for AIS Stream that receives real-time vessel positions and stores them in your Supabase database.

## Architecture

Based on the [seaspy](https://github.com/bbailey1024/seaspy.git) architecture:

1. **Backend Service** (this file) - Maintains persistent WebSocket connection to AIS Stream
2. **Database Storage** - Stores all vessel positions in Supabase
3. **Frontend API** - Queries vessels from database via `/api/vessels` endpoint
4. **Polling** - Frontend polls backend every 30 seconds for updates

## Why This Approach?

✅ **Secure** - API key stays on server, not exposed to browser
✅ **Scalable** - Single WebSocket connection serves all users
✅ **Persistent** - Vessel data stored in database
✅ **Efficient** - Frontend only queries visible map area

## Setup

### 1. Get AIS Stream API Key

Sign up for a free account at https://aisstream.io/ and get your API key.

### 2. Configure Environment Variables

Add to your `.env.local`:

```bash
# AIS Stream Configuration
AIS_STREAM_API_KEY=your_ais_stream_api_key_here

# Supabase (required for database access)
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Configure Bounding Boxes

Edit `ais-stream-backend.ts` and update the `DEFAULT_BOUNDING_BOXES` constant:

```typescript
const DEFAULT_BOUNDING_BOXES = [
  [
    [51.8, 4.2], // Rotterdam area (southwest)
    [52.0, 4.7], // (northeast)
  ],
  // Add more bounding boxes as needed
  [
    [1.2, 103.8], // Singapore Strait
    [1.4, 104.0],
  ],
]
```

You can find bounding boxes for areas at https://boundingbox.klokantech.com/

### 4. Run the Service

```bash
# Start the AIS backend service (in a separate terminal)
pnpm ais:start

# Start the Next.js dev server (in another terminal)
pnpm dev
```

The service will:
- Connect to AIS Stream WebSocket
- Subscribe to configured bounding boxes
- Store vessel positions in Supabase `vessels` and `vessel_positions` tables
- Auto-reconnect if connection drops
- Log all activity to console

### 5. View Vessels on Map

Visit http://localhost:3000/dashboard/tracking to see vessels on the map!

## How It Works

### Backend Service

1. **Connect** to AIS Stream WebSocket (`wss://stream.aisstream.io/v0/stream`)
2. **Subscribe** with API key and bounding boxes
3. **Receive** real-time AIS messages (Position Reports, Static Data)
4. **Process** and parse AIS data
5. **Store** in Supabase database
6. **Heartbeat** ping every 30 seconds to keep connection alive
7. **Reconnect** automatically if connection drops

### Frontend

1. **Query** vessels from `/api/vessels` endpoint
2. **Filter** by visible map bounding box
3. **Display** vessels on Mapbox map
4. **Poll** every 30 seconds for updates
5. **Real-time** updates via React Query cache invalidation

## AIS Message Types

The service handles two main AIS message types:

### Position Report (Types 1, 2, 3)
- Real-time vessel position (lat/lon)
- Speed over ground (knots)
- Course over ground (degrees)
- Heading (degrees)
- Navigation status

### Static Data (Type 5)
- Vessel name
- Call sign
- IMO number
- Ship type
- Destination
- ETA

## Database Schema

### `vessels` table
Stores current vessel information and latest position:
- `mmsi` (unique identifier)
- `vessel_name`
- `imo_number`
- `current_latitude`, `current_longitude`
- `current_speed_knots`, `current_heading`
- `destination_name`, `eta`
- `last_position_update`

### `vessel_positions` table
Stores historical position data:
- `vessel_id` (FK to vessels)
- `latitude`, `longitude`
- `speed_knots`, `heading`
- `timestamp`
- `data_source` ('aisstream')

## Configuration Options

### Bounding Boxes
Define geographic areas to receive vessel data:
```typescript
[
  [lat_south, lon_west],  // Southwest corner
  [lat_north, lon_east],  // Northeast corner
]
```

### MMSI Filters (Optional)
Subscribe to specific vessels only:
```typescript
FiltersShipMMSI: ['123456789', '987654321']
```

### Message Type Filters (Optional)
Subscribe to specific AIS message types:
```typescript
FilterMessageTypes: ['PositionReport', 'ShipStaticData']
```

## Monitoring

The service logs all activity:

```
[AIS Backend] Initialized
[AIS Backend] Starting...
[AIS Backend] Connecting to AIS Stream...
[AIS Backend] WebSocket connected
[AIS Backend] Sending subscription: { boxes: 1, mmsiFilters: 0 }
[AIS Backend] Updated vessel 244123456 (MSC Rotterdam)
[AIS Backend] Created new vessel 244234567 (Maersk Explorer)
```

## Troubleshooting

### "WebSocket connection failed: 503"
- Invalid API key or AIS Stream service down
- Check your `AIS_STREAM_API_KEY` in `.env.local`
- Verify API key at https://aisstream.io/

### "Could not find the table 'public.vessels'"
- Vessels table doesn't exist or schema cache not refreshed
- Run Migration 5 from `database_scripts.sql`
- Reload schema in Supabase dashboard: API → Reload Schema

### "SUPABASE_SERVICE_ROLE_KEY is required"
- Add service role key to `.env.local`
- Get from: Supabase Dashboard → Settings → API → service_role key

### No vessels appearing
- Check bounding box coordinates are correct
- Verify vessels are in the subscribed area (use https://www.marinetraffic.com/)
- Check service logs for errors
- Wait a few minutes for vessels to transmit positions

## Production Deployment

For production, run the AIS backend service as a separate process:

### Option 1: PM2 (recommended)
```bash
pm2 start pnpm --name "ais-backend" -- ais:start
pm2 save
pm2 startup
```

### Option 2: Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
CMD ["pnpm", "ais:start"]
```

### Option 3: Systemd Service
```ini
[Unit]
Description=GTMS AIS Backend Service
After=network.target

[Service]
Type=simple
User=gtms
WorkingDirectory=/path/to/GTMS
ExecStart=/usr/bin/pnpm ais:start
Restart=always

[Install]
WantedBy=multi-user.target
```

## API Costs

AIS Stream pricing (as of 2024):
- **Free tier**: Up to 5,000 messages/day
- **Paid plans**: Start at $10/month for 100,000 messages/day

Estimate: Each vessel transmits ~10-60 positions per hour depending on vessel type and speed.

## License

See LICENSE file in project root.
