# Server-Side uploadData API for SSR

## Approvers

| Approver | Role | Sign Off | Notes |
| --- | --- | --- | --- |
| Praneeta Prakash | PM - Amplify | 0 | |
| Avinash Karthik | SDM | 0 | |
| Matt Creaser | BR | 0 | |
| Alexandru Cornea | App sec engineer | 0 | |

## Glossary

| Term | Definition |
| --- | --- |
| SSR | Server-Side Rendering. Running JavaScript application code on a server to produce HTML responses (e.g., Next.js Route Handlers, Nuxt.js server routes). |
| Route Handler | Next.js App Router file (route.ts) that handles HTTP requests for a specific endpoint. |
| Server Action | Next.js function marked with 'use server' that runs on the server and can be invoked from client components. |
| HttpOnly cookie | Cookie flag that prevents client-side JavaScript from accessing the cookie value. Used for secure auth token storage. |
| Presigned URL | A temporary S3 URL that grants time-limited, pre-authorized access to perform a specific operation (e.g., PUT an object). |
| Multipart Upload | S3 mechanism for uploading large files in parts. Involves three steps: CreateMultipartUpload → UploadPart (multiple) → CompleteMultipartUpload. |
| ReadableStream | Web API standard for reading chunks of data asynchronously. Available in all modern SSR frameworks as request.body. |
| AmplifyServer.ContextSpec | Amplify type representing per-request server context, used to isolate credentials and state between concurrent requests. |
| CRC32 | Checksum algorithm used by S3 to verify part integrity during multipart uploads. |
| FormData | Web API for encoding form fields and files. request.formData() parses the full request body into memory. |
| BodyInit | Web API union type accepted by fetch and Request bodies: File, Blob, ArrayBuffer, string, FormData, or ReadableStream. |
| ETag | S3 response header containing a hash identifier for the uploaded object. Returned in ServerUploadDataOutput. |
| AbortMultipartUpload | S3 API called on cancel to clean up uploaded parts and stop incurring storage charges for orphaned multipart uploads. |

## 1. Executive Summary

This document describes the design for a server-side uploadData API in Amplify JS Storage, enabling file uploads from server-side rendering (SSR) contexts. This includes any JavaScript SSR framework — such as Next.js (Route Handlers, Server Actions, API Routes) and Nuxt.js (server routes, middleware).

### The Problem

The Amplify Storage uploadData API is currently only available on the client side. Developers building SSR applications (Next.js, Nuxt.js, etc.) cannot upload files from server-side contexts. This is a critical gap because:

1. When HttpOnly cookies are enabled for authentication, the client-side JavaScript cannot access auth tokens — making server-side upload the only viable path. This is the primary blocker preventing the @experimental tag from being removed from the HttpOnly cookie feature.
2. There are common use cases that require server-side uploads — such as coordinating uploads with database writes, uploading server-generated content, or applying server-side validation.

### Customer Evidence

- GitHub Issue #13636 — Feature request: "Upload images/files from NextJS API route backend". The author states: *"This is a very fundamental feature needed to ensure data consistency for applications."* (labeled: Storage, SSR, Next.js)
- StackOverflow — Developer asking how to upload images from a Next.js backend API route, highlighting the need for server-side upload support
- Internal: HttpOnly cookie @experimental tag removal is blocked until server-side upload is supported

### The Proposed Solution

Add a new server-side uploadData function that accepts AmplifyServer.ContextSpec and performs file uploads from SSR contexts. Three implementation approaches are evaluated in Section 2.1.

## 2. Technical Details

### 2.1 Approaches

All three approaches share nearly the same public API surface — same function signature, output types, and core input types. The differences are:

- **Approach C** additionally accepts ReadableStream as data and supports a contentLength option to optimize part sizing
- onProgress is not supported in any server-side approach

#### 2.1.1 Approach A: Presigned URL via getUrl + fetch

Uses the existing server-side getUrl API with method 'PUT' to generate a presigned upload URL, then performs the upload via fetch.

**Pros:**

- Simplest approach — no refactoring of existing code needed

**Cons:**

- Data must be fully in memory before upload — practical file size limited by available server RAM (typically well below S3's 5 GB single-PUT limit)
- Presigned URL expiration — for very large files on slow connections, the upload must complete before the URL expires
- Does not support checksumAlgorithm or preventOverwrite (presigned URL limitations)
- Hard 5 GB file size limit (single PUT — no multipart support)

#### 2.1.2 Approach B: Internal uploadData API

Refactors the existing client-side uploadData internal pipeline to work for both client and server contexts. Supports single-part and automatic multipart uploads.

**Pros:**

- Zero code duplication — reuses the existing battle-tested client-side upload pipeline (single-part, multipart, checksums, abort cleanup)
- Multipart support with CRC32 checksums, abort cleanup, and part integrity validation

**Cons:**

- Data must be fully in memory before upload
- Requires refactoring existing client-side internal code

#### 2.1.3 Approach C: Stream-based Multipart Upload (Recommended)

Accepts a ReadableStream as the data input and uploads chunks directly to S3 via multipart upload.

**How streaming works and why it helps:**

Modern SSR frameworks expose the incoming request body as a ReadableStream<Uint8Array> — a standard Web API that delivers data in small chunks as it arrives, rather than buffering the entire payload in memory first. The server reads chunks one at a time, processes them (e.g., forwards to S3), and releases memory before the next chunk arrives.

For large file uploads this is critical:

- **Bounded memory** — memory usage is bounded by the part size and upload concurrency, not by total file size. Uploads of any size use roughly the same amount of memory.
- **Parallel processing** — we can start uploading the first S3 part while the client is still sending later bytes
- **Backpressure** — if S3 is slow to accept data, the framework automatically slows down the incoming stream, preventing memory blowups

Without streaming (Approaches A and B), the entire file must be parsed into memory via request.formData() or similar before the upload can begin, limiting file size to available server RAM.

**Data flow comparison:**

Approach A (buffered — full file in memory, single PUT to S3):

```
┌─────────┐  full file  ┌────────────┐  full file  ┌────┐
│ Browser │ ──────────▶ │ Server     │ ──────────▶ │ S3 │
│         │             │ (buffers)  │  (single    │    │
└─────────┘             └────────────┘   PUT)      └────┘
                         ⚠️ RAM = file size
```

Approach B (buffered — full file in memory, then multipart to S3):

```
┌─────────┐  full file  ┌────────────┐   parts     ┌────┐
│ Browser │ ──────────▶ │ Server     │ ──▶──▶──▶── │ S3 │
│         │             │ (buffers)  │  (multipart)│    │
└─────────┘             └────────────┘             └────┘
                         ⚠️ RAM = file size
```

Approach C (streamed — chunks flow through without full buffering):

```
┌─────────┐   chunks    ┌────────────┐   parts     ┌────┐
│ Browser │ ──▶──▶──▶── │ Server     │ ──▶──▶──▶── │ S3 │
│         │             │ (buffers 1 │  (multipart)│    │
└─────────┘             │  part at a │             └────┘
                        │  time)     │
                        └────────────┘
                        ✅ RAM = part size × concurrency
```

**Pros:**

- Memory efficient — processes data in chunks without full-file buffering (no request.formData() parsing needed)
- Scales to concurrent uploads — memory per upload is bounded, so the server can handle many simultaneous large uploads without exhausting RAM
- Multipart support with CRC32 checksums, abort cleanup, and part integrity validation

**Cons:**

- Requires the client to send the file as a raw body (not FormData)
- Requires more new code compared to Approaches A and B (~1 additional day of implementation and testing)

### 2.2 API Changes

#### 2.2.1 Types

```
/**
 * Input type for server-side uploadData API.
 */
export interface ServerUploadDataWithPathInput {
    // The S3 object path to upload to
    path: string;
    // The data to upload — supports File, Blob, ArrayBuffer, string, and ReadableStream
    data: BodyInit | ReadableStream<Uint8Array>;
    // Optional upload options
    options?: UploadDataWithPathOptions & {
        // Hint for total size — used to optimize part size when data is a ReadableStream
        contentLength?: number;
    };
}

/**
 * Output type for server-side uploadData API.
 */
export interface ServerUploadDataOutput {
    path: string;            // The S3 object path
    eTag?: string;           // The ETag returned by S3
    contentType?: string;    // The content type of the uploaded object
    metadata?: Record<string, string>;  // User-defined metadata
    size?: number;           // The size of the uploaded object in bytes
}

/**
 * Task type for server-side uploadData API.
 */
export interface ServerUploadDataTask {
    result: Promise<ServerUploadDataOutput>;  // Resolves when the upload completes
    cancel(): void;                            // Cancels the in-progress upload
}
```

**Note:** onProgress is **not supported** in the server-side API. Server-side uploads run within a single request lifecycle with no client to report back to.

#### 2.2.2 Function Signature

```
import { AmplifyServer } from '@aws-amplify/core/internals/adapter-core';

export function uploadData(
    contextSpec: AmplifyServer.ContextSpec,
    input: ServerUploadDataWithPathInput,
): ServerUploadDataTask;
```

The function returns a ServerUploadDataTask containing:

- **.result** — a Promise<ServerUploadDataOutput> that resolves when the upload completes
- **.cancel()** — aborts the in-progress upload (triggers AbortMultipartUpload cleanup for multipart uploads to avoid orphaned parts and storage costs)

**Cancel example:**

```
const task = uploadData(contextSpec, {
    path: `uploads/${file.name}`,
    data: file,
});

// Cancel on a timeout
const timeoutId = setTimeout(() => task.cancel(), 60_000);

try {
    const result = await task.result;
    clearTimeout(timeoutId);
} catch (error) {
    if (isCancelError(error)) {
        // handle cancellation
    }
}
```

### 2.3 Error Handling

The server-side uploadData uses the same error types as the client-side API:

| Error | When | .result behavior |
| --- | --- | --- |
| CanceledError | .cancel() called while upload is in progress | .result rejects with CanceledError |
| StorageError | Invalid input, path validation failure, or auth error | .result rejects with StorageError |
| IntegrityError | CRC32 checksum mismatch on a part | .result rejects with IntegrityError |
| Network / S3 error | Connection failure, S3 5xx, access denied | .result rejects with StorageError wrapping the underlying error |

**cancel() behavior by lifecycle state:**

- **In-progress:** Aborts the upload. For multipart uploads, calls AbortMultipartUpload to clean up parts. .result rejects with CanceledError.
- **Completed:** No-op — the upload already succeeded.
- **Failed:** No-op — the upload already failed.

Callers can use isCancelError(error) (exported from aws-amplify/storage) to distinguish cancellation from other errors.

### 2.4 Usage Examples

#### Example 1: Next.js Route Handler (App Router)

```
// app/api/upload/route.ts
import { runWithAmplifyServerContext } from '@aws-amplify/adapter-nextjs';
import { uploadData } from 'aws-amplify/storage/server';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    const result = await runWithAmplifyServerContext({
        nextServerContext: { cookies },
        operation: async contextSpec => {
            const task = uploadData(contextSpec, {
                path: `uploads/${file.name}`,
                data: file,
                options: { contentType: file.type },
            });
            return await task.result;
        },
    });

    return Response.json({ path: result.path, eTag: result.eTag });
}
```

#### Example 2: Next.js Server Action

```
// app/actions.ts
'use server';

import { runWithAmplifyServerContext } from '@aws-amplify/adapter-nextjs';
import { uploadData } from 'aws-amplify/storage/server';
import { cookies } from 'next/headers';

export async function uploadFile(formData: FormData) {
    const file = formData.get('file') as File;

    return await runWithAmplifyServerContext({
        nextServerContext: { cookies },
        operation: async contextSpec => {
            const task = uploadData(contextSpec, {
                path: `uploads/${file.name}`,
                data: file,
            });
            return await task.result;
        },
    });
}
```

#### Example 3: Client Component Consuming the Server Action

```
'use client';

import { useState } from 'react';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);

    const handleUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        console.log('Upload result:', data);
    };

    return (
        <div>
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
}
```

#### Example 4: Next.js Stream Upload (Approach C)

```
// app/api/upload-stream/route.ts
import { runWithAmplifyServerContext } from '@aws-amplify/adapter-nextjs';
import { uploadData } from 'aws-amplify/storage/server';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    const filename = request.headers.get('x-filename') || 'upload';
    const contentType = request.headers.get('content-type') || 'application/octet-stream';
    const contentLength = Number(request.headers.get('content-length')) || undefined;

    const result = await runWithAmplifyServerContext({
        nextServerContext: { cookies },
        operation: async contextSpec => {
            const task = uploadData(contextSpec, {
                path: `uploads/${filename}`,
                data: request.body!, // ReadableStream — no formData() parsing needed
                options: { contentType, contentLength },
            });
            return await task.result;
        },
    });

    return Response.json({ path: result.path, eTag: result.eTag });
}
```

#### Example 5: Framework-Agnostic

The core uploadData API is framework-agnostic. The AmplifyServer.ContextSpec is provided by the framework-specific adapter (e.g., @aws-amplify/adapter-nextjs), but the upload logic itself works in any server environment. For frameworks like Nuxt.js or custom Express servers, the pattern is the same — only the adapter and context creation differ.

```
// Generic server-side usage (e.g., Nuxt.js server route, Express handler)
import { uploadData } from 'aws-amplify/storage/server';

// The contextSpec is provided by the framework-specific adapter
async function handleUpload(contextSpec, fileData: ArrayBuffer, fileName: string) {
    const task = uploadData(contextSpec, {
        path: `uploads/${fileName}`,
        data: fileData,
        options: { contentType: 'application/octet-stream' },
    });
    return await task.result;
}
```

### 2.5 Limitations and Constraints

- **SSR framework body size limits** — SSR frameworks impose default limits on request body sizes. These limits are configurable by the developer.
- **SSR framework request timeout** — SSR frameworks impose default request timeouts (e.g., ~5 minutes in Next.js dev server). Large file uploads may exceed this timeout. These limits are configurable by the developer or via custom server configuration.
- **No pause/resume** — Unlike the client-side uploadData which supports pause and resume for multipart uploads, the server-side version does not. Pause/resume relies on client-side state (localStorage caching of in-progress uploads) which is not applicable in server contexts.

## 3. Route Handler Generation

Amplify's @aws-amplify/adapter-nextjs package already provides a createAuthRouteHandlers factory that generates a complete set of auth endpoints (/api/auth/sign-in, /api/auth/sign-up, /api/auth/sign-out, /api/auth/sign-in-callback, /api/auth/sign-out-callback) from a single Next.js dynamic route file (app/api/auth/[slug]/route.ts). The factory dispatches internally based on the slug param, removing OAuth boilerplate entirely.

**Could we do the same for Storage?** Yes — a hypothetical createStorageRouteHandlers could generate /api/storage/upload, /api/storage/download, /api/storage/remove, /api/storage/list from a single route file.

**Why we are not doing this initially:**

- **Storage operations are not highly standardized** — unlike OAuth flows which follow a defined spec, storage uploads vary significantly per application (custom paths, metadata, validation logic, DB coordination).
- **Tight coupling to request shape** — generated routes must assume specific form field names, query params, and content types, limiting flexibility.
- **Doesn't accommodate custom logic** — many real-world uploads need pre-upload validation, metadata enrichment, or DB writes in the same request. A generated handler makes this awkward.
- **Framework-specific** — route generation is Next.js-specific (uses the [slug] dynamic route pattern). The core uploadData function is framework-agnostic and works in any SSR framework.

**Recommendation:** Ship uploadData as a plain server function (as proposed in this document). Developers write thin route handlers that call uploadData directly, retaining full control. Route generation can be revisited as a follow-up if customers request it.

## 4. Security Considerations

**Authentication and credential isolation:** The server-side uploadData uses AmplifyServer.ContextSpec to extract per-request credentials from the Amplify context — the same mechanism used by all existing server-side Storage APIs (getUrl, list, remove, getProperties). Credentials are scoped to the individual request and never shared across concurrent requests, avoiding state pollution. No new credential handling is introduced.

**Path validation:** The path input is validated by validateStorageOperationInput — the same validation used by all existing Storage APIs. This prevents path traversal (e.g., ../../private/key) and enforces the configured path prefix rules from the Amplify backend.

**Content-type and file validation:** The library does not perform content-type or file-type validation. This is the caller's responsibility — the library uploads whatever data it receives. Developers should validate file type, size, and content on the server before calling uploadData.

**Presigned URL scope (Approach A):** The presigned URL is generated and consumed entirely within the server-side function — it is never returned to or exposed to the client. The URL is scoped to a single PUT operation on the specific S3 key.

## 5. Estimations and Next Steps

| Item | Description | Estimation (days) | Priority | Status | Assignee |
| --- | --- | --- | --- | --- | --- |
| Design and API doc | The current document | — | P0 | Complete | Osama Rizk |
| Feature development | Code changes + unit tests | 1 | P0 | POC Complete | |
| Integration tests | Create new e2e tests for server-side upload | 1 | P0 | Not started | |
| Docs update | Update documentation to reflect the new server-side uploadData API | 0.5 | P0 | Not started | |
| Discord announcement | Announce the new feature to the community | 0.5 | P1 | Not started | |

**POC:** All three approaches implemented and verified end-to-end including multipart and stream uploads. Branch: feat/upload-api-ssr (https://github.com/aws-amplify/amplify-js/compare/main...feat/upload-api-ssr)

## Appendix: Links

- GitHub Issue #13636 — Upload from Next.js API route: https://github.com/aws-amplify/amplify-js/issues/13636
- GitHub Issue #14111 — Presigned URL upload request: https://github.com/aws-amplify/amplify-js/issues/14111
- GitHub Issue #7207 — Storage doesn't work with SSR context: https://github.com/aws-amplify/amplify-js/issues/7207
- StackOverflow: uploadData not working in Next.js backend: https://stackoverflow.com/questions/78782110/aws-amplify-gen-2-nextjs-how-to-upload-images-from-the-nextjs-backend-api-rout
- POC Implementation: https://github.com/aws-amplify/amplify-js/compare/main...feat/upload-api-ssr
- S3 Presigned URL Documentation: https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html
- Amplify SSR Documentation: https://docs.amplify.aws/nextjs/build-a-backend/server-side-rendering/
