# PayBridge

PayBridge is a hackathon prototype exploring PayPal-backed checkout through a reusable TypeScript SDK, a React merchant integration, and a browser extension. The project uses PayPal sandbox / simulated payment services during development.

## Repository layout

The repository is organized as a **monorepo**: applications live under `apps/`, while the reusable SDK is isolated under `packages/sdk/`.

```text
pay_bridge/
├── apps/
│   ├── extension/               # Chrome extension that consumes the SDK
│   └── playground/              # React + Vite UI component showcase
│
├── packages/
│   └── sdk/                     # TypeScript SDK package root
│       ├── src/
│       │   ├── api/             # Backend HTTP calls and API wrappers
│       │   ├── browser/         # Reusable browser / checkout DOM helpers
│       │   ├── core/            # Framework-independent SDK logic
│       │   ├── react/           # React components, hooks, and providers
│       │   ├── types/           # Shared TypeScript interfaces
│       │   └── index.ts         # Main SDK public entry point
│       ├── dist/                # Generated SDK bundle (do not edit)
│       ├── node_modules/        # Installed SDK dependencies (do not commit)
│       ├── package.json         # SDK dependencies, scripts, package metadata
│       ├── tsconfig.json        # SDK TypeScript configuration
│       └── tsdown.config.ts     # SDK bundling configuration
│
├── tests/                       # Existing repository-level tests
├── .gitignore
└── README.md
```

## Where code belongs

| Work                                               | Location                                                           | Notes                                                                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Checkout button, modal, status and confirmation UI | `packages/sdk/src/react/components/`                               | These are **reusable SDK components**, not playground-only implementations.                                                             |
| React hooks and context                            | `packages/sdk/src/react/hooks/`, `packages/sdk/src/react/context/` | Consume the SDK's framework-neutral interfaces.                                                                                         |
| React entry point                                  | `packages/sdk/src/react/index.ts`                                  | Public exports for a future `@paybridge/sdk/react` import.                                                                              |
| Core checkout state / client                       | `packages/sdk/src/core/`                                           | No React or Chrome extension-specific dependencies.                                                                                     |
| HTTP requests                                      | `packages/sdk/src/api/`                                            | Backend routes and auth contracts are still being defined.                                                                              |
| Session / checkout types                           | `packages/sdk/src/types/`                                          | Shared between API, core, and UI as appropriate.                                                                                        |
| Checkout-page detection / extraction utilities     | `packages/sdk/src/browser/`                                        | Reusable browser utilities for checkout detection, data extraction, and form interaction. Chrome-specific APIs remain in the extension. |
| Component gallery and mock examples                | `apps/playground/src/App.tsx`                                      | A consumer of the SDK, not the source of SDK components.                                                                                |
| Extension UI and Chrome integration                | `apps/extension/`                                                  | Should consume shared SDK functions rather than duplicate them.                                                                         |
| Tests                                              | `tests/` or package-local tests as agreed                          | Follow one consistent convention per package.                                                                                           |

## Working on SDK UI components

A suggested React component layout:

```text
packages/sdk/src/react/
├── components/
│   ├── PayBridgeButton.tsx
│   ├── PayBridgeCheckout.tsx
│   ├── PayBridgeStatus.tsx
│   ├── PayBridgeError.tsx
│   └── PayBridgeConfirmation.tsx
├── context/
│   └── PayBridgeProvider.tsx
├── hooks/
│   └── usePayBridge.ts
├── styles/
│   └── paybridge.css
├── types.ts
└── index.ts
```

Create files as needed; the component list is a plan, not a requirement to scaffold everything at once. Until backend endpoints are agreed upon, mock session data and callbacks in the playground.

### SDK entry points vs. playground page

- `packages/sdk/src/index.ts` exports framework-agnostic SDK functionality.
- `packages/sdk/src/react/index.ts` exports React components and hooks.
- `apps/playground/src/App.tsx` is the **visible page** showcasing the components.
- `apps/playground/src/main.tsx` mounts that page into Vite's `index.html`.

For early UI work, a Vite playground can import SDK source directly using a relative path. **After the move**, an import from `apps/playground/src/App.tsx` looks like:

```tsx
import PayBridgeButton from '../../../packages/sdk/src/react/components/PayBridgeButton';
```

Later, configure npm workspaces, tsdown entry points, and `package.json` exports so consumers can use the intended package interface:

```tsx
import { PayBridgeButton } from '@paybridge/sdk/react';
```

## Development

### React playground

```bash
cd apps/playground
npm install
npm run dev
```

### SDK package

```bash
cd packages/sdk
npm install
npm run build
```

### Workspace setup (For Later)

The SDK and apps currently live in one repository, but **folder placement alone does not configure npm workspaces**. To centrally manage them, create a root `package.json` similar to:

```json
{
  "name": "paybridge-monorepo",
  "private": true,
  "workspaces": ["packages/*", "apps/*"]
}
```

Then install dependencies from the repository root. Keep each app/package's own `package.json`; verify package names, build scripts, and exports before switching to package-name imports. This root workspace manifest is a **suggestion**, not a claim that it is already configured.

## Current scope

The immediate UI milestone is to scaffold and display PayBridge checkout components using mock states in `apps/playground`. Once backend contracts are defined, wire these components to the SDK client and verify that an independently configured React app can consume the built SDK package.
