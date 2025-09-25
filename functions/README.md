# Cloudflare Pages Functions

This directory contains the Cloudflare Pages functions that handle API requests for the petition application.

## Structure

```
functions/
├── _shared/           # Shared utilities and types
│   ├── types.ts       # TypeScript interfaces for Cloudflare environment
│   └── utils.ts       # Common utilities (CORS, error handling, etc.)
└── api/               # API endpoints
    ├── users.ts       # POST /api/users - Create user
    ├── users/
    │   └── [id].ts    # GET /api/users/:id - Get user by ID
    ├── petitions.ts   # GET /api/petitions, POST /api/petitions
    ├── petitions/
    │   ├── [id].ts    # GET /api/petitions/:id - Get petition by ID
    │   └── [id]/
    │       └── signatures.ts # GET /api/petitions/:id/signatures
    ├── signatures.ts  # POST /api/signatures - Create signature
    └── categories.ts  # GET /api/categories, POST /api/categories
```

## Individual Function Benefits

- **Better Organization**: Each endpoint has its own file
- **Type Safety**: Shared types and utilities across all functions
- **Error Handling**: Consistent error responses using shared utilities
- **Maintainability**: Easier to find and modify specific endpoints
- **Performance**: Cloudflare only loads the specific function code needed
- **Testing**: Each function can be tested independently

## Shared Utilities

### `_shared/types.ts`
- `Env` interface for Cloudflare environment (D1 database binding)
- `EventContext` interface for function context

### `_shared/utils.ts`
- `corsHeaders`: Standard CORS headers for all responses
- `handleCORS()`: Handle OPTIONS requests for CORS preflight
- `createErrorResponse()`: Standardized error response formatting
- `createSuccessResponse()`: Standardized success response formatting
- `createNotFoundResponse()`: Standardized 404 response
- `getDbService()`: Get DatabaseService instance from context

## Adding New Endpoints

1. Create a new `.ts` file in the appropriate directory under `functions/api/`
2. Import shared utilities from `../_shared/`
3. Export an `onRequest` function that takes `EventContext<Env>`
4. Use shared utilities for consistent responses and error handling

Example:
```typescript
import { Env, EventContext } from '../_shared/types'
import { handleCORS, createErrorResponse, createSuccessResponse, getDbService } from '../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    // Your logic here
    return createSuccessResponse(result)
  } catch (error) {
    return createErrorResponse(error)
  }
}
```