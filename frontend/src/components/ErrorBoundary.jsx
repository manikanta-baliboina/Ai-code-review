import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

function ErrorFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md rounded-3xl border border-rose-500/40 bg-slate-900/80 p-8 text-center shadow-2xl">
        <h1 className="font-display text-2xl font-semibold text-white">Something went wrong</h1>
        <p className="mt-3 text-sm text-slate-300">
          The interface hit an unexpected error. Refresh the page to try again.
        </p>
      </div>
    </div>
  );
}

/**
 * Functional error boundary wrapper.
 */
export default function ErrorBoundary({ children }) {
  return <ReactErrorBoundary FallbackComponent={ErrorFallback}>{children}</ReactErrorBoundary>;
}
