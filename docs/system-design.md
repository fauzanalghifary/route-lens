# RouteLens System Design

## Product Summary

RouteLens is a geography-focused AI image generation app that turns a selected route into a visual journey.

Users pick an origin and destination on a MapLibre map. RouteLens calculates or approximates the route, samples several points along the journey, writes scene prompts for those points, generates AI images through a backend service, stores the results server-side, and shows the route with a persistent gallery.

The generated images are not exact street-view reconstructions. They are visual impressions created from route geography and user-selected style.

Product positioning:

> AI-generated scenes inspired by the geography along your route.

## User Journey

1. The user opens RouteLens and sees an interactive map.
2. The user selects an origin point.
3. The user selects a destination point.
4. The app opens a confirmation panel showing the selected route request.
5. The user chooses generation options, such as visual style and number of scenes.
6. The user confirms generation.
7. The frontend sends the route request to the backend.
8. The backend creates a journey record for the user's anonymous session.
9. The backend calculates or approximates the route.
10. The backend samples 3 to 5 scene points along the route.
11. The backend writes AI prompts for each sampled point.
12. The backend calls the AI image API for each scene.
13. The backend validates each AI response, stores image files server-side, and saves scene metadata.
14. The frontend shows real progress states while the backend works.
15. When generation finishes, the frontend shows the route, origin marker, destination marker, scene markers, and generated image gallery.
16. The user can open a saved scene, tweak its prompt, and regenerate that scene without starting the route over.

## Request Journey

The browser never calls the AI image API directly. All AI calls go through the NestJS backend.

1. Browser sends `POST /journeys` with:
   - origin coordinates
   - destination coordinates
   - visual style
   - requested scene count
2. NestJS validates the request and resolves the anonymous session.
3. NestJS creates a `Journey` record with status `creating_route`.
4. NestJS calculates the route through a routing provider, or falls back to a straight-line route if needed.
5. NestJS samples scene points along the route and updates status to `choosing_scene_points`.
6. NestJS writes scene prompts and updates status to `writing_prompts`.
7. NestJS calls the AI image API from the backend and updates status to `generating_images`.
8. NestJS validates image responses and uploads generated images to server-side storage.
9. NestJS stores scene metadata and image storage keys in PostgreSQL.
10. NestJS updates the journey status to `completed`.
11. Browser polls `GET /journeys/:id` and updates the progress modal until the journey is complete or failed.
12. Browser renders the final route map and gallery from backend data.

## Progress States

The app exposes meaningful progress instead of a generic spinner.

- `creating_route`: validating coordinates and building route geometry
- `choosing_scene_points`: selecting representative points along the route
- `writing_prompts`: turning route points into AI image prompts
- `generating_images`: waiting for the AI image API
- `saving_gallery`: storing images and metadata server-side
- `completed`: route gallery is ready
- `failed`: route gallery could not be generated

The frontend displays these states in a modal while the backend is processing. Since AI image generation can take 10 to 30 seconds, the UI is designed around waiting instead of hiding it.

## Tech Stack

### Frontend

- React and Next.js
- TypeScript
- MapLibre GL for map interaction and route visualization

Next.js is used for a fast React development workflow and straightforward deployment. MapLibre is used because RouteLens is map-first, and the user journey begins with selecting points directly on a map.

### Backend

- NestJS
- TypeScript
- PostgreSQL
- Prisma

NestJS is used because it gives the backend clear modules, services, controllers, validation, and dependency boundaries. This matches the target role's stack and makes the AI, routing, storage, and journey logic easier to explain.

PostgreSQL stores journeys, scenes, statuses, errors, prompts, coordinates, and storage keys. Prisma is used for readable schema management and type-safe database access.

### Storage

- Supabase Storage or Cloudinary

Generated images are stored server-side. The database stores the image URL or storage key, but the image file itself lives in managed object storage.

### AI Image API

- Pollinations.ai or Gemini Image API

The backend owns all AI calls. The frontend only talks to RouteLens APIs. This keeps API keys and AI provider details out of the browser and allows the backend to normalize timeout, invalid response, and retry behavior.

### Routing

- OpenRouteService or OSRM
- Straight-line fallback route

The app should not fail completely just because the routing provider is unavailable. If route calculation fails, RouteLens can fall back to a straight-line route and label the result as an approximation.

### User Separation

- Anonymous session cookie

Full authentication is intentionally out of scope for the MVP. Each browser receives an anonymous session id, and all journeys are scoped to that session. This allows multiple users to generate at the same time without seeing each other's galleries.

## Core API Design

### Create Journey

`POST /journeys`

Creates a journey generation job.

Request body:

```json
{
  "origin": {
    "lat": -6.2088,
    "lng": 106.8456
  },
  "destination": {
    "lat": -6.1754,
    "lng": 106.8272
  },
  "style": "cinematic travel poster",
  "sceneCount": 3
}
```

Response body:

```json
{
  "journeyId": "journey_123",
  "status": "creating_route"
}
```

### Get Journey

`GET /journeys/:id`

Returns the latest journey status, route geometry, scenes, and any error details. The frontend polls this endpoint while generation is in progress.

### List Journeys

`GET /journeys`

Returns saved journeys for the current anonymous session.

### Regenerate Scene

`POST /scenes/:id/regenerate`

Regenerates one saved scene with an edited prompt. The existing journey remains intact.

Request body:

```json
{
  "prompt": "A rainy cinematic evening scene near the route, with warm street lights and dramatic clouds"
}
```

## Data Model

### Journey

- `id`
- `sessionId`
- `originLat`
- `originLng`
- `destinationLat`
- `destinationLng`
- `routeGeojson`
- `style`
- `sceneCount`
- `status`
- `errorCode`
- `errorMessage`
- `createdAt`
- `updatedAt`

### Scene

- `id`
- `journeyId`
- `order`
- `lat`
- `lng`
- `prompt`
- `imageUrl`
- `storageKey`
- `status`
- `errorCode`
- `errorMessage`
- `createdAt`
- `updatedAt`

## Concurrency Approach

Multiple users can generate journeys at the same time because every journey is scoped to a session id and stored independently in the database.

The backend treats generation as stateful work instead of relying on browser memory. The frontend can refresh the page and still recover the current or completed journey from the backend.

For the MVP, generation can run as an asynchronous backend task after `POST /journeys` creates the record. If the app needs to scale further, this processing can move to a queue such as BullMQ or a managed background job system without changing the main API contract.

## Failure Handling

### Invalid Input

Examples:

- missing origin or destination
- coordinates outside valid latitude or longitude ranges
- origin and destination are effectively the same point
- unsupported scene count

Behavior:

- backend returns `400`
- frontend shows a clear validation message
- no AI API call is made

### Routing Failure

Examples:

- routing provider timeout
- no route found
- provider returns malformed geometry

Behavior:

- backend falls back to a straight-line approximation when possible
- journey continues with a visible approximation note
- if fallback is impossible, journey status becomes `failed`

### AI Timeout

Examples:

- AI provider takes too long
- network request hangs

Behavior:

- backend aborts the AI call after a configured timeout
- scene status becomes `failed`
- journey status becomes `failed` or `completed_with_errors`, depending on how many scenes failed
- frontend shows a retry or regenerate option

### Broken AI Response

Examples:

- no image returned
- image URL is missing
- response body is not valid image data
- provider returns an unexpected schema

Behavior:

- backend does not save invalid image data
- scene status becomes `failed`
- error code is stored for debugging and demo proof
- frontend shows a visible failure state

### Storage Failure

Examples:

- upload fails
- storage provider returns no usable URL

Behavior:

- backend marks the affected scene as `failed`
- backend stores a storage-specific error code
- frontend shows that generation succeeded but saving failed

## MVP Scope

Included:

- map-based origin and destination selection
- confirmation panel before generation
- anonymous session cookie
- backend-only AI image API calls
- server-side image storage
- persistent journey gallery
- route line, origin marker, destination marker, and scene markers
- 3 default generated scenes
- scene-level prompt editing and regeneration
- visible progress states
- invalid input, timeout, and broken response handling

Not included:

- full user accounts
- payment or usage limits
- exact street-view accuracy
- turn-by-turn navigation
- mobile-native app
- complex route editing
- multi-route comparison

## Build Process

The project should be built in vertical slices:

1. Document system design and API boundaries.
2. Scaffold `api` with NestJS and `web` with Next.js.
3. Create the database schema for journeys and scenes.
4. Implement anonymous sessions.
5. Implement journey creation with fake route data and fake scene records.
6. Build the map selection flow and confirmation panel.
7. Add journey polling and progress modal.
8. Add route calculation and fallback route behavior.
9. Add scene point sampling.
10. Add prompt generation.
11. Integrate the AI image API through the backend.
12. Add image storage.
13. Add persistent gallery and scene regeneration.
14. Add visible failure states and demo paths.
15. Write README setup instructions and deployment notes.

This order prioritizes the full user journey first, then replaces fake internals with real routing, AI generation, and storage. It reduces the risk of spending too much time on external APIs before the core product flow works.

## Key Decisions

### Use NestJS for the backend

The target role uses NodeJS and NestJS. Using NestJS demonstrates backend structure, dependency boundaries, validation, and service-oriented design in the stack the company already uses.

### Use anonymous sessions instead of full authentication

Authentication is not required to prove the assignment goals. Anonymous sessions are enough to isolate users, persist galleries, and support concurrent usage while keeping the MVP focused.

### Use 3 scenes by default

Three scenes are enough to demonstrate route sampling, prompt generation, AI calls, gallery persistence, and regeneration. More scenes increase generation time and failure risk without adding much assessment value.

### Treat route scenes as AI impressions

The app should not imply that generated images are factual street-level photos. The product copy clearly states that the scenes are inspired by geography along the route.

### Keep routing resilient

RouteLens can use a real routing provider, but it should gracefully fall back to an approximate line when routing fails. This keeps the product demo reliable and shows practical failure handling.

## Known Limitations

- Generated scenes may not match the real-world location exactly.
- The quality of generated images depends on the AI provider and prompt quality.
- Straight-line fallback routes are approximations and may not follow real roads.
- Anonymous sessions are convenient for MVP but not a replacement for real accounts.
- Without a job queue, long-running generation is acceptable for MVP but not ideal for high traffic.
